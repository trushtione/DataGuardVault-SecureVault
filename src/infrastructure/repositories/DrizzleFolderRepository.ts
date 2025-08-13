import { IFolderRepository } from '../../domain/repositories/IFolderRepository';
import { Folder } from '../../domain/entities/Folder';
import { folders } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '../database/connection';

export class DrizzleFolderRepository implements IFolderRepository {
  async create(folder: Folder): Promise<Folder> {
    const [createdFolder] = await db.insert(folders).values({
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      parentId: folder.parentId,
      isDeleted: folder.isDeleted,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    }).returning();

    return new Folder({
      id: createdFolder.id,
      userId: createdFolder.userId,
      name: createdFolder.name,
      parentId: createdFolder.parentId,
      isDeleted: createdFolder.isDeleted,
      createdAt: createdFolder.createdAt,
      updatedAt: createdFolder.updatedAt
    });
  }

  async findById(id: string): Promise<Folder | null> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    
    if (!folder) return null;

    return new Folder({
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      parentId: folder.parentId,
      isDeleted: folder.isDeleted,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    });
  }

  async findByUserId(userId: string): Promise<Folder[]> {
    const userFolders = await db.select()
      .from(folders)
      .where(and(
        eq(folders.userId, userId),
        eq(folders.isDeleted, false)
      ));
    
    return userFolders.map(folder => new Folder({
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      parentId: folder.parentId,
      isDeleted: folder.isDeleted,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    }));
  }

  async findByParentId(parentId: string): Promise<Folder[]> {
    const childFolders = await db.select()
      .from(folders)
      .where(and(
        eq(folders.parentId, parentId),
        eq(folders.isDeleted, false)
      ));
    
    return childFolders.map(folder => new Folder({
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      parentId: folder.parentId,
      isDeleted: folder.isDeleted,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    }));
  }

  async update(id: string, updates: Partial<Folder>): Promise<Folder> {
    const [updatedFolder] = await db.update(folders)
      .set({
        name: updates.name,
        parentId: updates.parentId,
        isDeleted: updates.isDeleted,
        updatedAt: new Date()
      })
      .where(eq(folders.id, id))
      .returning();

    return new Folder({
      id: updatedFolder.id,
      userId: updatedFolder.userId,
      name: updatedFolder.name,
      parentId: updatedFolder.parentId,
      isDeleted: updatedFolder.isDeleted,
      createdAt: updatedFolder.createdAt,
      updatedAt: updatedFolder.updatedAt
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  async getDeletedFolders(userId: string): Promise<Folder[]> {
    const deletedFolders = await db.select()
      .from(folders)
      .where(and(
        eq(folders.userId, userId),
        eq(folders.isDeleted, true)
      ));
    
    return deletedFolders.map(folder => new Folder({
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      parentId: folder.parentId,
      isDeleted: folder.isDeleted,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    }));
  }

  async restore(id: string): Promise<Folder> {
    const [restoredFolder] = await db.update(folders)
      .set({
        isDeleted: false,
        updatedAt: new Date()
      })
      .where(eq(folders.id, id))
      .returning();

    return new Folder({
      id: restoredFolder.id,
      userId: restoredFolder.userId,
      name: restoredFolder.name,
      parentId: restoredFolder.parentId,
      isDeleted: restoredFolder.isDeleted,
      createdAt: restoredFolder.createdAt,
      updatedAt: restoredFolder.updatedAt
    });
  }
}
