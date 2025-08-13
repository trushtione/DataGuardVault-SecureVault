export interface BackupProps {
  id?: string;
  userId: string;
  filename: string;
  size: number;
  encryptedData: string;
  checksum: string;
  createdAt?: Date;
}

export class Backup {
  public readonly id: string;
  public readonly userId: string;
  public readonly filename: string;
  public readonly size: number;
  public readonly encryptedData: string;
  public readonly checksum: string;
  public readonly createdAt: Date;

  constructor(props: BackupProps) {
    this.id = props.id || crypto.randomUUID();
    this.userId = props.userId;
    this.filename = props.filename;
    this.size = props.size;
    this.encryptedData = props.encryptedData;
    this.checksum = props.checksum;
    this.createdAt = props.createdAt || new Date();
  }

  public rename(newFilename: string): Backup {
    return new Backup({
      ...this,
      filename: newFilename
    });
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      filename: this.filename,
      size: this.size,
      encryptedData: this.encryptedData,
      checksum: this.checksum,
      createdAt: this.createdAt
    };
  }
}
