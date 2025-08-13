import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { EncryptedFile } from "../../domain/entities/EncryptedFile";
import { randomUUID } from "crypto";

export class MockFileRepository implements IFileRepository {
  private files: Map<string, EncryptedFile> = new Map();

  async findById(id: string): Promise<EncryptedFile | null> {
    const file = this.files.get(id);
    return file || null;
  }

  async findByUserId(userId: string): Promise<EncryptedFile[]> {
    return Array.from(this.files.values()).filter(file => 
      file.userId === userId && !file.isDeleted
    );
  }

  async findByFolderId(folderId: string): Promise<EncryptedFile[]> {
    return Array.from(this.files.values()).filter(file => 
      file.folderId === folderId && !file.isDeleted
    );
  }

  async findByShareToken(token: string): Promise<EncryptedFile | null> {
    const file = Array.from(this.files.values()).find(file => 
      file.shareToken === token && 
      file.isShared && 
      (!file.shareExpiresAt || file.shareExpiresAt > new Date())
    );
    return file || null;
  }

  async create(file: EncryptedFile): Promise<EncryptedFile> {
    const id = randomUUID();
    const now = new Date();
    
    const newFile = new EncryptedFile({
      ...file,
      id,
      version: file.version || 1,
      isDeleted: false,
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
      isShared: file.isShared || false,
      shareToken: file.shareToken || undefined,
      shareExpiresAt: file.shareExpiresAt || undefined,
      folderId: file.folderId || undefined,
    });

    this.files.set(id, newFile);
    return newFile;
  }

  async update(id: string, updates: Partial<EncryptedFile>): Promise<EncryptedFile> {
    const file = this.files.get(id);
    if (!file) {
      throw new Error("File not found");
    }

    const updatedFile = new EncryptedFile({
      ...file,
      ...updates,
      updatedAt: new Date(),
    });

    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async delete(id: string): Promise<void> {
    const file = this.files.get(id);
    if (!file) {
      throw new Error("File not found");
    }

    const deletedFile = new EncryptedFile({
      ...file,
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });

    this.files.set(id, deletedFile);
  }

  async getDeletedFiles(userId: string): Promise<EncryptedFile[]> {
    return Array.from(this.files.values()).filter(file => 
      file.userId === userId && file.isDeleted
    );
  }

  async restore(id: string): Promise<EncryptedFile> {
    const file = this.files.get(id);
    if (!file) {
      throw new Error("File not found");
    }

    const restoredFile = new EncryptedFile({
      ...file,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date(),
    });

    this.files.set(id, restoredFile);
    return restoredFile;
  }

  async getUserStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    totalEncryptedSize: number;
  }> {
    const userFiles = Array.from(this.files.values()).filter(file => 
      file.userId === userId
    );

    const totalFiles = userFiles.filter(file => !file.isDeleted).length;
    const totalSize = userFiles.filter(file => !file.isDeleted).reduce((acc, file) => acc + file.size, 0);
    const totalEncryptedSize = userFiles.filter(file => !file.isDeleted).reduce((acc, file) => acc + (file.encryptedSize || file.size), 0);

    return {
      totalFiles,
      totalSize,
      totalEncryptedSize,
    };
  }
}
