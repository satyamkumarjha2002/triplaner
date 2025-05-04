import { IsOptional, IsString } from 'class-validator';

export class DeclineInvitationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
