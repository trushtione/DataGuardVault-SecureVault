import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/useCases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/useCases/auth/LoginUserUseCase';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      
      const result = await this.registerUserUseCase.execute({
        username,
        email,
        password,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      res.json({ user: result.user.toJSON() });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await this.loginUserUseCase.execute({
        email,
        password,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      res.json({ user: result.user.toJSON() });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }
}
