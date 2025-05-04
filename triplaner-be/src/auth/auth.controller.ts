import { Controller, Post, Body, Get, UseGuards, Req, ClassSerializerInterceptor, UseInterceptors, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { InvitationsService } from '../invitations/invitations.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitationsService: InvitationsService
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User authentication failed');
    }
    const authResult = await this.authService.login(req.user as User);
    
    // Add pending invitations to the response
    const pendingInvitations = await this.invitationsService.findUserInvitations((req.user as User).id);
    const hasPendingInvitations = pendingInvitations.some(inv => inv.status === 'pending');
    
    return {
      ...authResult,
      hasPendingInvitations
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request) {
    const user = req.user as User;
    
    // Add pending invitations to the response
    const pendingInvitations = await this.invitationsService.findUserInvitations(user.id);
    const hasPendingInvitations = pendingInvitations.some(inv => inv.status === 'pending');
    
    return {
      user,
      hasPendingInvitations
    };
  }

  // Logout is handled client-side by removing the token
  @Post('logout')
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('isAlive')
  isAlive() {
    return { message: 'Server is alive' };
  }
} 