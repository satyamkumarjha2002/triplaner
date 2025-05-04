import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { IsNotEmpty, IsString } from 'class-validator';
import OpenAI from 'openai';

export class PlanTripDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;
}

export class GenerateTripJsonDto {
  @IsNotEmpty()
  @IsString()
  conversation: string;
}

interface ErrorResponse {
  message: string;
  status?: number;
  stack?: string;
}

interface ApiResponse {
  success: boolean;
  data: OpenAI.Chat.ChatCompletionMessage;
}

@Controller('openai')
export class OpenAIController {
  private readonly logger = new Logger(OpenAIController.name);

  constructor(private readonly openaiService: OpenAIService) {}

  @Post('plan-trip')
  async planTrip(@Body() planTripDto: PlanTripDto): Promise<ApiResponse> {
    try {
      if (!planTripDto.prompt) {
        throw new BadRequestException('Prompt is required');
      }
      
      const result = await this.openaiService.planTrip(planTripDto.prompt);
      return { success: true, data: result };
    } catch (error: unknown) {
      const typedError = error as ErrorResponse;
      this.logger.error(`Failed to plan trip: ${typedError.message}`, typedError.stack);
      
      throw new HttpException(
        typedError.message || 'Failed to generate trip plan', 
        typedError.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('generate-trip-json')
  async generateTripJson(@Body() generateTripJsonDto: GenerateTripJsonDto): Promise<ApiResponse> {
    try {
      if (!generateTripJsonDto.conversation) {
        throw new BadRequestException('Conversation is required');
      }
      
      const result = await this.openaiService.generateTripJson(generateTripJsonDto.conversation);
      return { success: true, data: result };
    } catch (error: unknown) {
      const typedError = error as ErrorResponse;
      this.logger.error(`Failed to generate trip JSON: ${typedError.message}`, typedError.stack);
      
      throw new HttpException(
        typedError.message || 'Failed to generate trip JSON', 
        typedError.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
