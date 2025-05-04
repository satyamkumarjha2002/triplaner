import { IsOptional, IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ActivityCategory } from '../entities/activity.entity';

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsEnum(ActivityCategory)
  category?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
} 