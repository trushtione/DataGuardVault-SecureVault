export interface EncryptedFileProps {
  id?: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  encryptedSize: number;
  checksum: string;
  encryptionKey: string;
  iv: string;
  isShared?: boolean;
  shareToken?: string;
  shareExpiresAt?: Date;
  folderId?: string;
  version?: number;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EncryptedFile {
  public readonly id: string;
  public readonly userId: string;
  public readonly filename: string;
  public readonly originalName: string;
  public readonly mimeType: string;
  public readonly size: number;
  public readonly encryptedSize: number;
  public readonly checksum: string;
  public readonly encryptionKey: string;
  public readonly iv: string;
  public readonly isShared: boolean;
  public readonly shareToken?: string;
  public readonly shareExpiresAt?: Date;
  public readonly folderId?: string;
  public readonly version: number;
  public readonly isDeleted: boolean;
  public readonly deletedAt?: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: EncryptedFileProps) {
    this.id = props.id || crypto.randomUUID();
    this.userId = props.userId;
    this.filename = props.filename;
    this.originalName = props.originalName;
    this.mimeType = props.mimeType;
    this.size = props.size;
    this.encryptedSize = props.encryptedSize;
    this.checksum = props.checksum;
    this.encryptionKey = props.encryptionKey;
    this.iv = props.iv;
    this.isShared = props.isShared || false;
    this.shareToken = props.shareToken;
    this.shareExpiresAt = props.shareExpiresAt;
    this.folderId = props.folderId;
    this.version = props.version || 1;
    this.isDeleted = props.isDeleted || false;
    this.deletedAt = props.deletedAt;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public share(expiresAt?: Date): EncryptedFile {
    const shareToken = crypto.randomUUID();
    return new EncryptedFile({
      ...this,
      isShared: true,
      shareToken,
      shareExpiresAt: expiresAt,
      updatedAt: new Date()
    });
  }

  public unshare(): EncryptedFile {
    return new EncryptedFile({
      ...this,
      isShared: false,
      shareToken: undefined,
      shareExpiresAt: undefined,
      updatedAt: new Date()
    });
  }

  public moveToFolder(folderId: string): EncryptedFile {
    return new EncryptedFile({
      ...this,
      folderId,
      updatedAt: new Date()
    });
  }

  public delete(): EncryptedFile {
    return new EncryptedFile({
      ...this,
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date()
    });
  }

  public restore(): EncryptedFile {
    return new EncryptedFile({
      ...this,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date()
    });
  }

  public incrementVersion(): EncryptedFile {
    return new EncryptedFile({
      ...this,
      version: this.version + 1,
      updatedAt: new Date()
    });
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      filename: this.filename,
      originalName: this.originalName,
      mimeType: this.mimeType,
      size: this.size,
      encryptedSize: this.encryptedSize,
      checksum: this.checksum,
      isShared: this.isShared,
      shareToken: this.shareToken,
      shareExpiresAt: this.shareExpiresAt,
      folderId: this.folderId,
      version: this.version,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
