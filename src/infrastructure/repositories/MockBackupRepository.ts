import { IBackupRepository } from "../../domain/repositories/IBackupRepository";
import { Backup } from "../../domain/entities/Backup";
import { randomUUID } from "crypto";

export class MockBackupRepository implements IBackupRepository {
  private backups: Map<string, Backup> = new Map();

  async create(backup: Backup): Promise<Backup> {
    const id = randomUUID();
    const now = new Date();
    
    const newBackup = new Backup({
      ...backup,
      id,
      createdAt: now,
      updatedAt: now,
    });

    this.backups.set(id, newBackup);
    return newBackup;
  }

  async findById(id: string): Promise<Backup | undefined> {
    return this.backups.get(id);
  }

  async findByUserId(userId: string): Promise<Backup[]> {
    return Array.from(this.backups.values()).filter(backup => 
      backup.userId === userId
    );
  }

  async update(id: string, updates: Partial<Backup>): Promise<Backup> {
    const backup = this.backups.get(id);
    if (!backup) {
      throw new Error("Backup not found");
    }

    const updatedBackup = new Backup({
      ...backup,
      ...updates,
      updatedAt: new Date(),
    });

    this.backups.set(id, updatedBackup);
    return updatedBackup;
  }

  async delete(id: string): Promise<void> {
    this.backups.delete(id);
  }

  async findRecent(userId: string, limit: number = 10): Promise<Backup[]> {
    return Array.from(this.backups.values())
      .filter(backup => backup.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
