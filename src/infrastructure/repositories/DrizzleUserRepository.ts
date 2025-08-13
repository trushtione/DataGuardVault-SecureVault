import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../database/connection';

export class DrizzleUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const [createdUser] = await db.insert(users).values({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    }).returning();

    return new User({
      id: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      password: createdUser.password,
      twoFactorEnabled: createdUser.twoFactorEnabled,
      twoFactorSecret: createdUser.twoFactorSecret,
      createdAt: createdUser.createdAt,
      lastActive: createdUser.lastActive
    });
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) return null;

    return new User({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) return null;

    return new User({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (!user) return null;

    return new User({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    });
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        username: updates.username,
        email: updates.email,
        password: updates.password,
        twoFactorEnabled: updates.twoFactorEnabled,
        twoFactorSecret: updates.twoFactorSecret,
        lastActive: updates.lastActive
      })
      .where(eq(users.id, id))
      .returning();

    return new User({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      password: updatedUser.password,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      twoFactorSecret: updatedUser.twoFactorSecret,
      createdAt: updatedUser.createdAt,
      lastActive: updatedUser.lastActive
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async findAll(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    
    return allUsers.map(user => new User({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    }));
  }
}
