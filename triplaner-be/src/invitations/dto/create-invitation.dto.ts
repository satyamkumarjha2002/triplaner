import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
