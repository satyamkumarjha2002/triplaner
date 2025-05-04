import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateActivityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
