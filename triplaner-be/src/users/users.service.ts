import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(currentUserId?: string): Promise<User[]> {
    // If a currentUserId is provided, exclude that user from results
    const where = currentUserId ? { id: Not(currentUserId) } : {};

    // Always limit to a reasonable number to prevent performance issues
    return this.usersRepository.find({
      where,
      take: 30, // Limit to 30 users for the list
    });
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    // If no query is provided, return an empty array
    if (!query || query.trim() === '') {
      return [];
    }

    // Search for users where email or username contains the query string
    // Exclude the current user from results
    return this.usersRepository.find({
      where: [
        { email: ILike(`%${query}%`), id: Not(currentUserId) },
        { username: ILike(`%${query}%`), id: Not(currentUserId) },
        { name: ILike(`%${query}%`), id: Not(currentUserId) },
      ],
      take: 10, // Limit results to 10 users
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with same email exists
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if user with same username exists
    const existingUsername = await this.findByUsername(createUserDto.username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Create new user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);

    // If trying to update password, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Update user
    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findOne(userId);

    // Only update the name field
    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }

    return this.usersRepository.save(user);
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.findOne(userId);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      salt,
    );

    // Update password
    user.password = hashedPassword;
    await this.usersRepository.save(user);
  }
}
