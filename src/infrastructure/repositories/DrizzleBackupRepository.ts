import { IBackupRepository } from '../../domain/repositories/IBackupRepository';
import { Backup } from '../../domain/entities/Backup';
import { backups } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../database/connection';

export class DrizzleBackupRepository implements IBackupRepository {
  async create(backup: Backup): Promise<Backup> {
    const [createdBackup] = await db.insert(backups).values({
      id: backup.id,
      userId: backup.userId,
      filename: backup.filename,
      size: backup.size,
      encryptedData: backup.encryptedData,
      checksum: backup.checksum,
      createdAt: backup.createdAt
    }).returning();

    return new Backup({
      id: createdBackup.id,
      userId: createdBackup.userId,
      filename: createdBackup.filename,
      size: createdBackup.size,
      encryptedData: createdBackup.encryptedData,
      checksum: createdBackup.checksum,
      createdAt: createdBackup.createdAt
    });
  }

  async findById(id: string): Promise<Backup | null> {
    const [backup] = await db.select().from(backups).where(eq(backups.id, id));
    
    if (!backup) return null;

    return new Backup({
      id: backup.id,
      userId: backup.userId,
      filename: backup.filename,
      size: backup.size,
      encryptedData: backup.encryptedData,
      checksum: backup.checksum,
      createdAt: backup.createdAt
    });
  }

  async findByUserId(userId: string): Promise<Backup[]> {
    const userBackups = await db.select()
      .from(backups)
      .where(eq(backups.userId, userId))
      .orderBy(backups.createdAt);
    
    return userBackups.map(backup => new Backup({
      id: backup.id,
      userId: backup.userId,
      filename: backup.filename,
      size: backup.size,
      encryptedData: backup.encryptedData,
      checksum: backup.checksum,
      createdAt: backup.createdAt
    }));
  }

  async update(id: string, updates: Partial<Backup>): Promise<Backup> {
    const [updatedBackup] = await db.update(backups)
      .set({
        filename: updates.filename,
        size: updates.size,
        encryptedData: updates.encryptedData,
        checksum: updates.checksum
      })
      .where(eq(backups.id, id))
      .returning();

    return new Backup({
      id: updatedBackup.id,
      userId: updatedBackup.userId,
      filename: updatedBackup.filename,
      size: updatedBackup.size,
      encryptedData: updatedBackup.encryptedData,
      checksum: updatedBackup.checksum,
      createdAt: updatedBackup.createdAt
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(backups).where(eq(backups.id, id));
  }

  async findAll(): Promise<Backup[]> {
    const allBackups = await db.select()
      .from(backups)
      .orderBy(backups.createdAt);
    
    return allBackups.map(backup => new Backup({
      id: backup.id,
      userId: backup.userId,
      filename: backup.filename,
      size: backup.size,
      encryptedData: backup.encryptedData,
      checksum: backup.checksum,
      createdAt: backup.createdAt
    }));
  }
}
