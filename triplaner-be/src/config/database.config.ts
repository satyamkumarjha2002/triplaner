import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
  // Only log errors, not SQL queries
  logging: ["error"],
  retryAttempts: 5,
  retryDelay: 3000,
};
