import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  buildingCode!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}
