export interface AuditLogProps {
  id?: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

export class AuditLog {
  public readonly id: string;
  public readonly userId: string;
  public readonly action: string;
  public readonly resourceType: string;
  public readonly resourceId: string;
  public readonly metadata?: Record<string, any>;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly createdAt: Date;

  constructor(props: AuditLogProps) {
    this.id = props.id || crypto.randomUUID();
    this.userId = props.userId;
    this.action = props.action;
    this.resourceType = props.resourceType;
    this.resourceId = props.resourceId;
    this.metadata = props.metadata;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt || new Date();
  }

  public addMetadata(key: string, value: any): AuditLog {
    return new AuditLog({
      ...this,
      metadata: {
        ...this.metadata,
        [key]: value
      }
    });
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt
    };
  }
}
