import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../../domain/entities/AuditLog';

export interface LoginUserRequest {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginUserResponse {
  user: User;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.password !== request.password) {
      throw new Error('Invalid credentials');
    }

    // Update last active
    const updatedUser = user.updateLastActive();
    await this.userRepository.update(user.id, updatedUser);

    // Create audit log
    const auditLog = new AuditLog({
      userId: user.id,
      action: 'login',
      resourceType: 'user',
      resourceId: user.id,
      metadata: { email: user.email },
      ipAddress: request.ipAddress,
      userAgent: request.userAgent
    });

    await this.auditLogRepository.create(auditLog);

    return { user: updatedUser };
  }
}
