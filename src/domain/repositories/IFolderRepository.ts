import { Folder } from '../entities/Folder';

export interface IFolderRepository {
  create(folder: Folder): Promise<Folder>;
  findById(id: string): Promise<Folder | null>;
  findByUserId(userId: string): Promise<Folder[]>;
  findByParentId(parentId: string): Promise<Folder[]>;
  update(id: string, updates: Partial<Folder>): Promise<Folder>;
  delete(id: string): Promise<void>;
  getDeletedFolders(userId: string): Promise<Folder[]>;
  restore(id: string): Promise<Folder>;
}
