export interface UserProps {
  id?: string;
  username: string;
  email: string;
  password: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  createdAt?: Date;
  lastActive?: Date;
}

export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly email: string;
  public readonly password: string;
  public readonly twoFactorEnabled: boolean;
  public readonly twoFactorSecret?: string;
  public readonly createdAt: Date;
  public readonly lastActive: Date;

  constructor(props: UserProps) {
    this.id = props.id || crypto.randomUUID();
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.twoFactorEnabled = props.twoFactorEnabled || false;
    this.twoFactorSecret = props.twoFactorSecret;
    this.createdAt = props.createdAt || new Date();
    this.lastActive = props.lastActive || new Date();
  }

  public updateLastActive(): User {
    return new User({
      ...this,
      lastActive: new Date()
    });
  }

  public enableTwoFactor(secret: string): User {
    return new User({
      ...this,
      twoFactorEnabled: true,
      twoFactorSecret: secret
    });
  }

  public disableTwoFactor(): User {
    return new User({
      ...this,
      twoFactorEnabled: false,
      twoFactorSecret: undefined
    });
  }

  public toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      twoFactorEnabled: this.twoFactorEnabled,
      createdAt: this.createdAt,
      lastActive: this.lastActive
    };
  }
}
