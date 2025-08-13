import { EncryptedFile } from '../entities/EncryptedFile';

export interface IFileRepository {
  create(file: EncryptedFile): Promise<EncryptedFile>;
  findById(id: string): Promise<EncryptedFile | null>;
  findByUserId(userId: string): Promise<EncryptedFile[]>;
  findByFolderId(folderId: string): Promise<EncryptedFile[]>;
  findByShareToken(token: string): Promise<EncryptedFile | null>;
  update(id: string, updates: Partial<EncryptedFile>): Promise<EncryptedFile>;
  delete(id: string): Promise<void>;
  getDeletedFiles(userId: string): Promise<EncryptedFile[]>;
  restore(id: string): Promise<EncryptedFile>;
  getUserStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    totalEncryptedSize: number;
  }>;
}
