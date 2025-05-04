import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateVoteDto {
  @IsNotEmpty()
  @IsBoolean()
  isUpvote: boolean;
} 