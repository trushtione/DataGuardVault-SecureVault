import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertFileSchema, insertFolderSchema, insertAuditLogSchema, insertBackupSchema } from "@shared/schema";
import multer from "multer";
import { randomBytes } from "crypto";

// Extend Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: user.id,
        action: "register",
        resourceType: "user",
        resourceId: user.id,
        metadata: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last active
      await storage.updateUser(user.id, { lastActive: new Date() });

      // Create audit log
      await storage.createAuditLog({
        userId: user.id,
        action: "login",
        resourceType: "user",
        resourceId: user.id,
        metadata: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // File routes
  app.get("/api/files/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const files = await storage.getFilesByUser(userId);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/files", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const fileData = insertFileSchema.parse({
        ...req.body,
        size: req.file.size,
        encryptedSize: req.file.buffer.length,
      });

      const file = await storage.createFile(fileData);

      // Create audit log
      await storage.createAuditLog({
        userId: file.userId,
        action: "upload",
        resourceType: "file",
        resourceId: file.id,
        metadata: { filename: file.filename, size: file.size },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(file);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        userId: file.userId,
        action: "download",
        resourceType: "file",
        resourceId: file.id,
        metadata: { filename: file.filename },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(file);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const updates = req.body;
      const file = await storage.updateFile(req.params.id, updates);

      // Create audit log
      await storage.createAuditLog({
        userId: file.userId,
        action: "update",
        resourceType: "file",
        resourceId: file.id,
        metadata: { filename: file.filename, updates },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(file);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      await storage.deleteFile(req.params.id);

      // Create audit log
      await storage.createAuditLog({
        userId: file.userId,
        action: "delete",
        resourceType: "file",
        resourceId: file.id,
        metadata: { filename: file.filename },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json({ message: "File deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/files/:id/share", async (req, res) => {
    try {
      const { expiresAt } = req.body;
      const shareToken = randomBytes(32).toString('hex');
      
      const file = await storage.updateFile(req.params.id, {
        isShared: true,
        shareToken,
        shareExpiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      // Create audit log
      await storage.createAuditLog({
        userId: file.userId,
        action: "share",
        resourceType: "file",
        resourceId: file.id,
        metadata: { filename: file.filename, shareToken },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json({ shareToken, file });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/shared/:token", async (req, res) => {
    try {
      const file = await storage.getSharedFile(req.params.token);
      if (!file) {
        return res.status(404).json({ message: "Shared file not found or expired" });
      }

      res.json(file);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Folder routes
  app.get("/api/folders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const folders = await storage.getFoldersByUser(userId);
      res.json(folders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const folderData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(folderData);

      // Create audit log
      await storage.createAuditLog({
        userId: folder.userId,
        action: "create",
        resourceType: "folder",
        resourceId: folder.id,
        metadata: { name: folder.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(folder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Trash routes
  app.get("/api/trash/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const deletedFiles = await storage.getDeletedFiles(userId);
      res.json(deletedFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trash/:id/restore", async (req, res) => {
    try {
      const file = await storage.restoreFile(req.params.id);

      // Create audit log
      await storage.createAuditLog({
        userId: file.userId,
        action: "restore",
        resourceType: "file",
        resourceId: file.id,
        metadata: { filename: file.filename },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(file);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Statistics routes
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Audit logs routes
  app.get("/api/audit/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const logs = await storage.getAuditLogs(userId);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Backup routes
  app.post("/api/backups", async (req, res) => {
    try {
      const backupData = insertBackupSchema.parse(req.body);
      const backup = await storage.createBackup(backupData);

      // Create audit log
      await storage.createAuditLog({
        userId: backup.userId,
        action: "create_backup",
        resourceType: "backup",
        resourceId: backup.id,
        metadata: { filename: backup.filename, size: backup.size },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(backup);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/backups/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const backups = await storage.getBackups(userId);
      res.json(backups);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
