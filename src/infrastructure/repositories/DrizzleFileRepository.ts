import { IFileRepository } from '../../domain/repositories/IFileRepository';
import { EncryptedFile } from '../../domain/entities/EncryptedFile';
import { encryptedFiles } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '../database/connection';

export class DrizzleFileRepository implements IFileRepository {
  async create(file: EncryptedFile): Promise<EncryptedFile> {
    const [createdFile] = await db.insert(encryptedFiles).values({
      id: file.id,
      userId: file.userId,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      encryptedSize: file.encryptedSize,
      checksum: file.checksum,
      encryptionKey: file.encryptionKey,
      iv: file.iv,
      isShared: file.isShared,
      shareToken: file.shareToken,
      shareExpiresAt: file.shareExpiresAt,
      folderId: file.folderId,
      version: file.version,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }).returning();

    return new EncryptedFile({
      id: createdFile.id,
      userId: createdFile.userId,
      filename: createdFile.filename,
      originalName: createdFile.originalName,
      mimeType: createdFile.mimeType,
      size: createdFile.size,
      encryptedSize: createdFile.encryptedSize,
      checksum: createdFile.checksum,
      encryptionKey: createdFile.encryptionKey,
      iv: createdFile.iv,
      isShared: createdFile.isShared,
      shareToken: createdFile.shareToken,
      shareExpiresAt: createdFile.shareExpiresAt,
      folderId: createdFile.folderId,
      version: createdFile.version,
      isDeleted: createdFile.isDeleted,
      deletedAt: createdFile.deletedAt,
      createdAt: createdFile.createdAt,
      updatedAt: createdFile.updatedAt
    });
  }

  async findById(id: string): Promise<EncryptedFile | null> {
    const [file] = await db.select().from(encryptedFiles).where(eq(encryptedFiles.id, id));
    
    if (!file) return null;

    return new EncryptedFile({
      id: file.id,
      userId: file.userId,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      encryptedSize: file.encryptedSize,
      checksum: file.checksum,
      encryptionKey: file.encryptionKey,
      iv: file.iv,
      isShared: file.isShared,
      shareToken: file.shareToken,
      shareExpiresAt: file.shareExpiresAt,
      folderId: file.folderId,
      version: file.version,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    });
  }

  async findByUserId(userId: string): Promise<EncryptedFile[]> {
    const files = await db.select()
      .from(encryptedFiles)
      .where(and(
        eq(encryptedFiles.userId, userId),
        eq(encryptedFiles.isDeleted, false)
      ));
    
    return files.map(file => new EncryptedFile({
      id: file.id,
      userId: file.userId,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      encryptedSize: file.encryptedSize,
      checksum: file.checksum,
      encryptionKey: file.encryptionKey,
      iv: file.iv,
      isShared: file.isShared,
      shareToken: file.shareToken,
      shareExpiresAt: file.shareExpiresAt,
      folderId: file.folderId,
      version: file.version,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }));
  }

  async findByFolderId(folderId: string): Promise<EncryptedFile[]> {
    const files = await db.select()
      .from(encryptedFiles)
      .where(and(
        eq(encryptedFiles.folderId, folderId),
        eq(encryptedFiles.isDeleted, false)
      ));
    
    return files.map(file => new EncryptedFile({
      id: file.id,
      userId: file.userId,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      encryptedSize: file.encryptedSize,
      checksum: file.checksum,
      encryptionKey: file.encryptionKey,
      iv: file.iv,
      isShared: file.isShared,
      shareToken: file.shareToken,
      shareExpiresAt: file.shareExpiresAt,
      folderId: file.folderId,
      version: file.version,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }));
  }

  async findByShareToken(token: string): Promise<EncryptedFile | null> {
    const [file] = await db.select()
      .from(encryptedFiles)
      .where(and(
        eq(encryptedFiles.shareToken, token),
        eq(encryptedFiles.isShared, true),
        eq(encryptedFiles.isDeleted, false)
      ));
    
    if (!file) return null;

    return new EncryptedFile({
      id: file.id,
      userId: file.userId,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      encryptedSize: file.encryptedSize,
      checksum: file.checksum,
      encryptionKey: file.encryptionKey,
      iv: file.iv,
      isShared: file.isShared,
      shareToken: file.shareToken,
      shareExpiresAt: file.shareExpiresAt,
      folderId: file.folderId,
      version: file.version,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    });
  }

  async update(id: string, updates: Partial<EncryptedFile>): Promise<EncryptedFile> {
    const [updatedFile] = await db.update(encryptedFiles)
      .set({
        filename: updates.filename,
        originalName: updates.originalName,
        mimeType: updates.mimeType,
        size: updates.size,
        encryptedSize: updates.encryptedSize,
        checksum: updates.checksum,
        encryptionKey: updates.encryptionKey,
        iv: updates.iv,
        isShared: updates.isShared,
        shareToken: updates.shareToken,
        shareExpiresAt: updates.shareExpiresAt,
        folderId: updates.folderId,
        version: updates.version,
        isDeleted: updates.isDeleted,
        deletedAt: updates.deletedAt,
        updatedAt: new Date()
      })
      .where(eq(encryptedFiles.id, id))
      .returning();

    return new EncryptedFile({
      id: updatedFile.id,
      userId: updatedFile.userId,
      filename: updatedFile.filename,
      originalName: updatedFile.originalName,
      mimeType: updatedFile.mimeType,
      size: updatedFile.size,
      encryptedSize: updatedFile.encryptedSize,
      checksum: updatedFile.checksum,
      encryptionKey: updatedFile.encryptionKey,
      iv: updatedFile.iv,
      isShared: updatedFile.isShared,
      shareToken: updatedFile.shareToken,
      shareExpiresAt: updatedFile.shareExpiresAt,
      folderId: updatedFile.folderId,
      version: updatedFile.version,
      isDeleted: updatedFile.isDeleted,
      deletedAt: updatedFile.deletedAt,
      createdAt: updatedFile.createdAt,
      updatedAt: updatedFile.updatedAt
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(encryptedFiles).where(eq(encryptedFiles.id, id));
  }

  async getDeletedFiles(userId: string): Promise<EncryptedFile[]> {
    const files = await db.select()
      .from(encryptedFiles)
      .where(and(
        eq(encryptedFiles.userId, userId),
        eq(encryptedFiles.isDeleted, true)
      ));
    
    return files.map(file => new EncryptedFile({
      id: file.id,
      userId: file.userId,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      encryptedSize: file.encryptedSize,
      checksum: file.checksum,
      encryptionKey: file.encryptionKey,
      iv: file.iv,
      isShared: file.isShared,
      shareToken: file.shareToken,
      shareExpiresAt: file.shareExpiresAt,
      folderId: file.folderId,
      version: file.version,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }));
  }

  async restore(id: string): Promise<EncryptedFile> {
    const [restoredFile] = await db.update(encryptedFiles)
      .set({
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date()
      })
      .where(eq(encryptedFiles.id, id))
      .returning();

    return new EncryptedFile({
      id: restoredFile.id,
      userId: restoredFile.userId,
      filename: restoredFile.filename,
      originalName: restoredFile.originalName,
      mimeType: restoredFile.mimeType,
      size: restoredFile.size,
      encryptedSize: restoredFile.encryptedSize,
      checksum: restoredFile.checksum,
      encryptionKey: restoredFile.encryptionKey,
      iv: restoredFile.iv,
      isShared: restoredFile.isShared,
      shareToken: restoredFile.shareToken,
      shareExpiresAt: restoredFile.shareExpiresAt,
      folderId: restoredFile.folderId,
      version: restoredFile.version,
      isDeleted: restoredFile.isDeleted,
      deletedAt: restoredFile.deletedAt,
      createdAt: restoredFile.createdAt,
      updatedAt: restoredFile.updatedAt
    });
  }

  async getUserStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    totalEncryptedSize: number;
  }> {
    const files = await this.findByUserId(userId);
    
    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      totalEncryptedSize: files.reduce((sum, file) => sum + file.encryptedSize, 0)
    };
  }
}
