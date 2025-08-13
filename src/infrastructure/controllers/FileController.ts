import { Request, Response } from 'express';
import { UploadFileUseCase } from '../../application/useCases/files/UploadFileUseCase';
import { IFileRepository } from '../../domain/repositories/IFileRepository';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../domain/entities/AuditLog';

export interface MulterRequest extends Request {
  file?: any; // Using any for now to avoid type issues
}

export class FileController {
  constructor(
    private uploadFileUseCase: UploadFileUseCase,
    private fileRepository: IFileRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async upload(req: MulterRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file provided" });
        return;
      }

      const result = await this.uploadFileUseCase.execute({
        userId: req.body.userId,
        filename: req.file.filename || req.file.originalname || 'unknown',
        originalName: req.file.originalname || 'unknown',
        mimeType: req.file.mimetype || 'application/octet-stream',
        size: req.file.size,
        encryptedSize: req.file.buffer.length,
        checksum: this.generateChecksum(req.file.buffer),
        encryptionKey: req.body.encryptionKey || 'default-key',
        iv: req.body.iv || 'default-iv',
        folderId: req.body.folderId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      res.json(result.file.toJSON());
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getFiles(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({ message: "User ID required" });
        return;
      }

      const files = await this.fileRepository.findByUserId(userId);
      res.json(files.map(file => file.toJSON()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id);
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      // Create audit log for download
      const auditLog = new AuditLog({
        userId: file.userId,
        action: 'download',
        resourceType: 'file',
        resourceId: file.id,
        metadata: { filename: file.filename },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      await this.auditLogRepository.create(auditLog);

      res.json(file.toJSON());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id);
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      await this.fileRepository.delete(req.params.id);

      // Create audit log
      const auditLog = new AuditLog({
        userId: file.userId,
        action: 'delete',
        resourceType: 'file',
        resourceId: file.id,
        metadata: { filename: file.filename },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      await this.auditLogRepository.create(auditLog);

      res.json({ message: "File deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async shareFile(req: Request, res: Response): Promise<void> {
    try {
      const { expiresAt } = req.body;
      const file = await this.fileRepository.findById(req.params.id);
      
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      // Create shared version of the file
      const sharedFile = file.share(expiresAt ? new Date(expiresAt) : undefined);
      const updatedFile = await this.fileRepository.update(file.id, sharedFile);

      // Create audit log
      const auditLog = new AuditLog({
        userId: file.userId,
        action: 'share',
        resourceType: 'file',
        resourceId: file.id,
        metadata: { 
          filename: file.filename, 
          shareToken: sharedFile.shareToken,
          expiresAt: expiresAt
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      await this.auditLogRepository.create(auditLog);

      // Generate the sharing URL
      const shareUrl = `${req.protocol}://${req.get('host')}/shared/${sharedFile.shareToken}`;

      res.json({ 
        shareToken: sharedFile.shareToken, 
        shareUrl,
        expiresAt: sharedFile.shareExpiresAt,
        file: updatedFile.toJSON() 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async revokeShare(req: Request, res: Response): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id);
      
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      if (!file.isShared) {
        res.status(400).json({ message: "File is not currently shared" });
        return;
      }

      // Create unshared version of the file
      const unsharedFile = file.unshare();
      const updatedFile = await this.fileRepository.update(file.id, unsharedFile);

      // Create audit log
      const auditLog = new AuditLog({
        userId: file.userId,
        action: 'revoke_share',
        resourceType: 'file',
        resourceId: file.id,
        metadata: { 
          filename: file.filename, 
          previousShareToken: file.shareToken
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      await this.auditLogRepository.create(auditLog);

      res.json({ 
        message: "File sharing revoked successfully",
        file: updatedFile.toJSON() 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSharedFile(req: Request, res: Response): Promise<void> {
    try {
      const file = await this.fileRepository.findByShareToken(req.params.token);
      if (!file) {
        res.status(404).json({ message: "Shared file not found or expired" });
        return;
      }

      res.json(file.toJSON());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  private generateChecksum(buffer: Buffer): string {
    // Simple checksum implementation - in production, use a proper hash function
    let checksum = 0;
    for (let i = 0; i < buffer.length; i++) {
      checksum = ((checksum << 5) - checksum + buffer[i]) & 0xffffffff;
    }
    return checksum.toString(16);
  }
}
