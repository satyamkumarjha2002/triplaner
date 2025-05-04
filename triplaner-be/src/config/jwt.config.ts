import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'triplaner-super-secret-jwt-key',
  signOptions: {
    expiresIn: '7d',
  },
};
