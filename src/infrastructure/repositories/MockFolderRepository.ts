import { IFolderRepository } from '../../domain/repositories/IFolderRepository';
import { Folder } from '../../domain/entities/Folder';
import { db } from '../database/connection';

export class MockFolderRepository implements IFolderRepository {
  async create(folder: Folder): Promise<Folder> {
    db.folders.set(folder.id, folder);
    return folder;
  }

  async findById(id: string): Promise<Folder | null> {
    return db.folders.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Folder[]> {
    const userFolders: Folder[] = [];
    for (const folder of db.folders.values()) {
      if (folder.userId === userId) {
        userFolders.push(folder);
      }
    }
    return userFolders;
  }

  async findByParentId(parentId: string): Promise<Folder[]> {
    const childFolders: Folder[] = [];
    for (const folder of db.folders.values()) {
      if (folder.parentId === parentId) {
        childFolders.push(folder);
      }
    }
    return childFolders;
  }

  async update(id: string, updates: Partial<Folder>): Promise<Folder> {
    const existingFolder = db.folders.get(id);
    if (!existingFolder) {
      throw new Error('Folder not found');
    }
    
    const updatedFolder = new Folder({
      ...existingFolder,
      ...updates
    });
    
    db.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async delete(id: string): Promise<void> {
    db.folders.delete(id);
  }

  async getDeletedFolders(userId: string): Promise<Folder[]> {
    const deletedFolders: Folder[] = [];
    for (const folder of db.folders.values()) {
      if (folder.userId === userId && folder.isDeleted) {
        deletedFolders.push(folder);
      }
    }
    return deletedFolders;
  }

  async restore(id: string): Promise<Folder> {
    const folder = db.folders.get(id);
    if (!folder) {
      throw new Error('Folder not found');
    }
    
    const restoredFolder = folder.restore();
    db.folders.set(id, restoredFolder);
    return restoredFolder;
  }
}
