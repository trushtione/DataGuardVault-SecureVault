import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../domain/entities/AuditLog';
import { auditLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../database/connection';

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  async create(auditLog: AuditLog): Promise<AuditLog> {
    const [createdLog] = await db.insert(auditLogs).values({
      id: auditLog.id,
      userId: auditLog.userId,
      action: auditLog.action,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      metadata: auditLog.metadata,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt
    }).returning();

    return new AuditLog({
      id: createdLog.id,
      userId: createdLog.userId,
      action: createdLog.action,
      resourceType: createdLog.resourceType,
      resourceId: createdLog.resourceId,
      metadata: createdLog.metadata,
      ipAddress: createdLog.ipAddress,
      userAgent: createdLog.userAgent,
      createdAt: createdLog.createdAt
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    
    if (!log) return null;

    return new AuditLog({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    });
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const logs = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(auditLogs.createdAt);
    
    return logs.map(log => new AuditLog({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }));
  }

  async findByResourceType(resourceType: string): Promise<AuditLog[]> {
    const logs = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.resourceType, resourceType))
      .orderBy(auditLogs.createdAt);
    
    return logs.map(log => new AuditLog({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }));
  }

  async findByResourceId(resourceId: string): Promise<AuditLog[]> {
    const logs = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.resourceId, resourceId))
      .orderBy(auditLogs.createdAt);
    
    return logs.map(log => new AuditLog({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }));
  }

  async findByAction(action: string): Promise<AuditLog[]> {
    const logs = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.action, action))
      .orderBy(auditLogs.createdAt);
    
    return logs.map(log => new AuditLog({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }));
  }

  async findAll(): Promise<AuditLog[]> {
    const allLogs = await db.select()
      .from(auditLogs)
      .orderBy(auditLogs.createdAt);
    
    return allLogs.map(log => new AuditLog({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }));
  }
}
