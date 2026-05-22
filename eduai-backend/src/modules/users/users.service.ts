import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

type CreateUserInput = {
  fullName: string;
  email: string;
  password: string;
  role: User['role'];
};

type SafeUser = Pick<
  User,
  'id' | 'fullName' | 'email' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public findAll(): Promise<SafeUser[]> {
    return this.userRepository.find({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }
  public findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  public create(input: CreateUserInput): Promise<User> {
    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }

  public async updatePassword(userId: string, password: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { password });
  }
}
