import { AuditLog } from '../entities/AuditLog';

export interface IAuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findByUserId(userId: string): Promise<AuditLog[]>;
  findByResourceType(resourceType: string): Promise<AuditLog[]>;
  findByResourceId(resourceId: string): Promise<AuditLog[]>;
  findByAction(action: string): Promise<AuditLog[]>;
  findAll(): Promise<AuditLog[]>;
}
