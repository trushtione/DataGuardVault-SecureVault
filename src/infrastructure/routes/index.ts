import type { Express } from "express";
import { createServer, type Server } from "http";
import { container } from "../di/container";
import { Folder } from "../../domain/entities/Folder";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", (req, res) => {
    container.authController.register(req, res);
  });

  app.post("/api/auth/login", (req, res) => {
    container.authController.login(req, res);
  });

  // File routes
  app.get("/api/files/:userId", (req, res) => {
    container.fileController.getFiles(req, res);
  });

  app.post("/api/files", upload.single('file'), (req, res) => {
    container.fileController.upload(req, res);
  });

  app.get("/api/files/:id", (req, res) => {
    container.fileController.getFile(req, res);
  });

  app.delete("/api/files/:id", (req, res) => {
    container.fileController.deleteFile(req, res);
  });

  app.post("/api/files/:id/share", (req, res) => {
    container.fileController.shareFile(req, res);
  });

  app.delete("/api/files/:id/share", (req, res) => {
    container.fileController.revokeShare(req, res);
  });

  app.get("/api/shared/:token", (req, res) => {
    container.fileController.getSharedFile(req, res);
  });

  // Folder routes (using direct repository for now)
  app.get("/api/folders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const folders = await container.folderRepository.findByUserId(userId);
      res.json(folders.map(folder => folder.toJSON()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const { userId, name, parentId } = req.body;
      const folder = new Folder({
        userId,
        name,
        parentId
      });
      
      const createdFolder = await container.folderRepository.create(folder);

      // Create audit log
      await container.auditLogRepository.create({
        userId: createdFolder.userId,
        action: 'create',
        resourceType: 'folder',
        resourceId: createdFolder.id,
        metadata: { name: createdFolder.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      } as any);

      res.json(createdFolder.toJSON());
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

      const deletedFiles = await container.fileRepository.getDeletedFiles(userId);
      res.json(deletedFiles.map(file => file.toJSON()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trash/:id/restore", async (req, res) => {
    try {
      const file = await container.fileRepository.restore(req.params.id);

      // Create audit log
      await container.auditLogRepository.create({
        userId: file.userId,
        action: 'restore',
        resourceType: 'file',
        resourceId: file.id,
        metadata: { filename: file.filename },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      } as any);

      res.json(file.toJSON());
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

      const stats = await container.fileRepository.getUserStats(userId);
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

      const logs = await container.auditLogRepository.findByUserId(userId);
      res.json(logs.map(log => log.toJSON()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Backup routes
  app.post("/api/backups", async (req, res) => {
    try {
      const { userId, filename, size, encryptedData, checksum } = req.body;
      const backup = await container.backupRepository.create({
        userId,
        filename,
        size,
        encryptedData,
        checksum
      } as any);

      // Create audit log
      await container.auditLogRepository.create({
        userId: backup.userId,
        action: 'create_backup',
        resourceType: 'backup',
        resourceId: backup.id,
        metadata: { filename: backup.filename, size: backup.size },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      } as any);

      res.json(backup.toJSON());
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

      const backups = await container.backupRepository.findByUserId(userId);
      res.json(backups.map(backup => backup.toJSON()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
