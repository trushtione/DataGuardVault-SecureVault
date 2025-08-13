import { IAuditLogRepository } from "../../domain/repositories/IAuditLogRepository";
import { AuditLog } from "../../domain/entities/AuditLog";
import { randomUUID } from "crypto";

export class MockAuditLogRepository implements IAuditLogRepository {
  private auditLogs: Map<string, AuditLog> = new Map();

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const now = new Date();
    
    const newAuditLog = new AuditLog({
      ...auditLog,
      id,
      createdAt: now,
    });

    this.auditLogs.set(id, newAuditLog);
    return newAuditLog;
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(log => 
      log.userId === userId
    );
  }

  async findByResourceType(resourceType: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(log => 
      log.resourceType === resourceType
    );
  }

  async findByAction(action: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(log => 
      log.action === action
    );
  }

  async findRecent(limit: number = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
