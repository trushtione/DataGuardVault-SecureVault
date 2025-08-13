import { AuthController } from "../controllers/AuthController";
import { FileController } from "../controllers/FileController";
import { RegisterUserUseCase } from "../../application/useCases/auth/RegisterUserUseCase";
import { LoginUserUseCase } from "../../application/useCases/auth/LoginUserUseCase";
import { UploadFileUseCase } from "../../application/useCases/files/UploadFileUseCase";
import { MockUserRepository } from "../repositories/MockUserRepository";
import { MockFolderRepository } from "../repositories/MockFolderRepository";
import { MockFileRepository } from "../repositories/MockFileRepository";
import { MockAuditLogRepository } from "../repositories/MockAuditLogRepository";
import { MockBackupRepository } from "../repositories/MockBackupRepository";

// Create repository instances
const userRepository = new MockUserRepository();
const folderRepository = new MockFolderRepository();
const fileRepository = new MockFileRepository();
const auditLogRepository = new MockAuditLogRepository();
const backupRepository = new MockBackupRepository();

// Create use cases
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const uploadFileUseCase = new UploadFileUseCase(fileRepository, auditLogRepository);

// Create controllers
const authController = new AuthController(registerUserUseCase, loginUserUseCase, auditLogRepository);
const fileController = new FileController(uploadFileUseCase, fileRepository, auditLogRepository);

export const container = {
  // Repositories
  userRepository,
  folderRepository,
  fileRepository,
  auditLogRepository,
  backupRepository,

  // Use Cases
  registerUserUseCase,
  loginUserUseCase,
  uploadFileUseCase,

  // Controllers
  authController,
  fileController,
};
