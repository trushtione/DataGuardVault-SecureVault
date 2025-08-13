import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { db } from '../database/connection';

export class MockUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    db.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return db.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of db.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of db.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const existingUser = db.users.get(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser = new User({
      ...existingUser,
      ...updates
    });
    
    db.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    db.users.delete(id);
  }

  async findAll(): Promise<User[]> {
    return Array.from(db.users.values());
  }
}
