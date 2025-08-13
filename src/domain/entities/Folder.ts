export interface FolderProps {
  id?: string;
  userId: string;
  name: string;
  parentId?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Folder {
  public readonly id: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly parentId?: string;
  public readonly isDeleted: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: FolderProps) {
    this.id = props.id || crypto.randomUUID();
    this.userId = props.userId;
    this.name = props.name;
    this.parentId = props.parentId;
    this.isDeleted = props.isDeleted || false;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public rename(newName: string): Folder {
    return new Folder({
      ...this,
      name: newName,
      updatedAt: new Date()
    });
  }

  public moveToParent(parentId: string): Folder {
    return new Folder({
      ...this,
      parentId,
      updatedAt: new Date()
    });
  }

  public delete(): Folder {
    return new Folder({
      ...this,
      isDeleted: true,
      updatedAt: new Date()
    });
  }

  public restore(): Folder {
    return new Folder({
      ...this,
      isDeleted: false,
      updatedAt: new Date()
    });
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      parentId: this.parentId,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
