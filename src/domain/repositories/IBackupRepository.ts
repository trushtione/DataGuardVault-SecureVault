import { Backup } from '../entities/Backup';

export interface IBackupRepository {
  create(backup: Backup): Promise<Backup>;
  findById(id: string): Promise<Backup | null>;
  findByUserId(userId: string): Promise<Backup[]>;
  update(id: string, updates: Partial<Backup>): Promise<Backup>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Backup[]>;
}
