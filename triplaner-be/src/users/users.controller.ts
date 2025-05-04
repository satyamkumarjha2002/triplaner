import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Request } from 'express';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: Request): Promise<User[]> {
    const currentUserId = (req.user as User).id;
    return this.usersService.findAll(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchUsers(
    @Query('query') query: string,
    @Req() req: Request,
  ): Promise<User[]> {
    const currentUserId = (req.user as User).id;
    return this.usersService.searchUsers(query, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request): User {
    return req.user as User;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const userId = (req.user as User).id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async updatePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const userId = (req.user as User).id;
    await this.usersService.updatePassword(userId, updatePasswordDto);
    return { message: 'Password updated successfully' };
  }
}
