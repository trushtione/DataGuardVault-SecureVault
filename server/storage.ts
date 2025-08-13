import { type User, type InsertUser, type EncryptedFile, type InsertFile, type Folder, type InsertFolder, type AuditLog, type InsertAuditLog, type Backup, type InsertBackup } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // File operations
  getFile(id: string): Promise<EncryptedFile | undefined>;
  getFilesByUser(userId: string): Promise<EncryptedFile[]>;
  getFilesByFolder(folderId: string): Promise<EncryptedFile[]>;
  getSharedFile(shareToken: string): Promise<EncryptedFile | undefined>;
  createFile(file: InsertFile): Promise<EncryptedFile>;
  updateFile(id: string, updates: Partial<EncryptedFile>): Promise<EncryptedFile>;
  deleteFile(id: string): Promise<void>;
  getDeletedFiles(userId: string): Promise<EncryptedFile[]>;
  restoreFile(id: string): Promise<EncryptedFile>;

  // Folder operations
  getFolder(id: string): Promise<Folder | undefined>;
  getFoldersByUser(userId: string): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: string, updates: Partial<Folder>): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;

  // Audit operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId: string): Promise<AuditLog[]>;

  // Backup operations
  createBackup(backup: InsertBackup): Promise<Backup>;
  getBackups(userId: string): Promise<Backup[]>;
  getBackup(id: string): Promise<Backup | undefined>;

  // Statistics
  getUserStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    deletedFiles: number;
    sharedFiles: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private files: Map<string, EncryptedFile> = new Map();
  private folders: Map<string, Folder> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
  private backups: Map<string, Backup> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      createdAt: now,
      lastActive: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getFile(id: string): Promise<EncryptedFile | undefined> {
    return this.files.get(id);
  }

  async getFilesByUser(userId: string): Promise<EncryptedFile[]> {
    return Array.from(this.files.values()).filter(file => 
      file.userId === userId && !file.isDeleted
    );
  }

  async getFilesByFolder(folderId: string): Promise<EncryptedFile[]> {
    return Array.from(this.files.values()).filter(file => 
      file.folderId === folderId && !file.isDeleted
    );
  }

  async getSharedFile(shareToken: string): Promise<EncryptedFile | undefined> {
    return Array.from(this.files.values()).find(file => 
      file.shareToken === shareToken && 
      file.isShared && 
      (!file.shareExpiresAt || file.shareExpiresAt > new Date())
    );
  }

  async createFile(insertFile: InsertFile): Promise<EncryptedFile> {
    const id = randomUUID();
    const now = new Date();
    const file: EncryptedFile = {
      ...insertFile,
      id,
      version: 1,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      isShared: insertFile.isShared || false,
      shareToken: insertFile.shareToken || null,
      shareExpiresAt: insertFile.shareExpiresAt || null,
      folderId: insertFile.folderId || null,
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, updates: Partial<EncryptedFile>): Promise<EncryptedFile> {
    const file = this.files.get(id);
    if (!file) throw new Error("File not found");
    
    const updatedFile = { ...file, ...updates, updatedAt: new Date() };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    const file = this.files.get(id);
    if (!file) throw new Error("File not found");
    
    const updatedFile = { 
      ...file, 
      isDeleted: true, 
      deletedAt: new Date(), 
      updatedAt: new Date() 
    };
    this.files.set(id, updatedFile);
  }

  async getDeletedFiles(userId: string): Promise<EncryptedFile[]> {
    return Array.from(this.files.values()).filter(file => 
      file.userId === userId && file.isDeleted
    );
  }

  async restoreFile(id: string): Promise<EncryptedFile> {
    const file = this.files.get(id);
    if (!file) throw new Error("File not found");
    
    const updatedFile = { 
      ...file, 
      isDeleted: false, 
      deletedAt: null, 
      updatedAt: new Date() 
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async getFolder(id: string): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async getFoldersByUser(userId: string): Promise<Folder[]> {
    return Array.from(this.folders.values()).filter(folder => 
      folder.userId === userId && !folder.isDeleted
    );
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = randomUUID();
    const now = new Date();
    const folder: Folder = {
      ...insertFolder,
      id,
      parentId: insertFolder.parentId || null,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const folder = this.folders.get(id);
    if (!folder) throw new Error("Folder not found");
    
    const updatedFolder = { ...folder, ...updates, updatedAt: new Date() };
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: string): Promise<void> {
    const folder = this.folders.get(id);
    if (!folder) throw new Error("Folder not found");
    
    const updatedFolder = { 
      ...folder, 
      isDeleted: true, 
      updatedAt: new Date() 
    };
    this.folders.set(id, updatedFolder);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      ...insertLog,
      id,
      metadata: insertLog.metadata || null,
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createBackup(insertBackup: InsertBackup): Promise<Backup> {
    const id = randomUUID();
    const backup: Backup = {
      ...insertBackup,
      id,
      createdAt: new Date(),
    };
    this.backups.set(id, backup);
    return backup;
  }

  async getBackups(userId: string): Promise<Backup[]> {
    return Array.from(this.backups.values())
      .filter(backup => backup.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getBackup(id: string): Promise<Backup | undefined> {
    return this.backups.get(id);
  }

  async getUserStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    deletedFiles: number;
    sharedFiles: number;
  }> {
    const userFiles = Array.from(this.files.values()).filter(file => file.userId === userId);
    
    return {
      totalFiles: userFiles.filter(file => !file.isDeleted).length,
      totalSize: userFiles.filter(file => !file.isDeleted).reduce((sum, file) => sum + file.size, 0),
      deletedFiles: userFiles.filter(file => file.isDeleted).length,
      sharedFiles: userFiles.filter(file => file.isShared && !file.isDeleted).length,
    };
  }
}

export const storage = new MemStorage();

// Initialize with sample data
(async () => {
  // Add sample files
  await storage.createFile({
    userId: "demo-user-id",
    filename: "encrypted_document.pdf",
    originalName: "Important Document.pdf",
    mimeType: "application/pdf",
    size: 1024000,
    encryptedSize: 1024512,
    encryptionKey: "demo-key-123",
    iv: "demo-iv-456",
    checksum: "abc123",
  });

  await storage.createFile({
    userId: "demo-user-id",
    filename: "encrypted_image.jpg",
    originalName: "Profile Picture.jpg",
    mimeType: "image/jpeg",
    size: 512000,
    encryptedSize: 512256,
    encryptionKey: "demo-key-789",
    iv: "demo-iv-101",
    checksum: "def456",
  });

  // Add sample audit logs
  await storage.createAuditLog({
    userId: "demo-user-id",
    action: "upload",
    resourceType: "file",
    resourceId: "file-123",
    metadata: {
      filename: "Important Document.pdf",
      size: 1024000,
      mimeType: "application/pdf"
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });

  await storage.createAuditLog({
    userId: "demo-user-id",
    action: "login",
    resourceType: "session",
    resourceId: "session-456",
    metadata: {
      loginMethod: "password"
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });

  await storage.createAuditLog({
    userId: "demo-user-id",
    action: "share",
    resourceType: "file",
    resourceId: "file-789",
    metadata: {
      filename: "Profile Picture.jpg",
      shareToken: "abc123def456",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });

  await storage.createAuditLog({
    userId: "demo-user-id",
    action: "download",
    resourceType: "file",
    resourceId: "file-123",
    metadata: {
      filename: "Important Document.pdf",
      downloadedAt: new Date().toISOString()
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });

  // Add a sample backup
  await storage.createBackup({
    userId: "demo-user-id",
    filename: "securevault-backup-2025-01-13.json",
    size: 2048576,
    encryptedData: JSON.stringify({
      version: "1.0",
      timestamp: new Date().toISOString(),
      files: [],
      folders: [],
      keys: [],
    }),
    checksum: "backup-checksum-123",
  });
})();
