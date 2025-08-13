import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../../domain/entities/AuditLog';

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterUserResponse {
  user: User;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    // Check if user already exists
    const existingUserByEmail = await this.userRepository.findByEmail(request.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await this.userRepository.findByUsername(request.username);
    if (existingUserByUsername) {
      throw new Error('Username already taken');
    }

    // Create new user
    const user = new User({
      username: request.username,
      email: request.email,
      password: request.password
    });

    const createdUser = await this.userRepository.create(user);

    // Create audit log
    const auditLog = new AuditLog({
      userId: createdUser.id,
      action: 'register',
      resourceType: 'user',
      resourceId: createdUser.id,
      metadata: { email: createdUser.email },
      ipAddress: request.ipAddress,
      userAgent: request.userAgent
    });

    await this.auditLogRepository.create(auditLog);

    return { user: createdUser };
  }
}
