import { EncryptedFile } from '../../../domain/entities/EncryptedFile';
import { IFileRepository } from '../../../domain/repositories/IFileRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../../domain/entities/AuditLog';

export interface UploadFileRequest {
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  encryptedSize: number;
  checksum: string;
  encryptionKey: string;
  iv: string;
  folderId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UploadFileResponse {
  file: EncryptedFile;
}

export class UploadFileUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(request: UploadFileRequest): Promise<UploadFileResponse> {
    const file = new EncryptedFile({
      userId: request.userId,
      filename: request.filename,
      originalName: request.originalName,
      mimeType: request.mimeType,
      size: request.size,
      encryptedSize: request.encryptedSize,
      checksum: request.checksum,
      encryptionKey: request.encryptionKey,
      iv: request.iv,
      folderId: request.folderId
    });

    const createdFile = await this.fileRepository.create(file);

    // Create audit log
    const auditLog = new AuditLog({
      userId: request.userId,
      action: 'upload',
      resourceType: 'file',
      resourceId: createdFile.id,
      metadata: { 
        filename: createdFile.filename, 
        size: createdFile.size,
        originalName: createdFile.originalName
      },
      ipAddress: request.ipAddress,
      userAgent: request.userAgent
    });

    await this.auditLogRepository.create(auditLog);

    return { file: createdFile };
  }
}
