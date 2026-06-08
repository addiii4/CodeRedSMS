import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsIn(['join', 'create'])
  mode!: 'join' | 'create';

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  /** Building code: existing-org code when mode='join', new code to claim when mode='create'. */
  @IsString()
  buildingCode!: string;

  /** Display name for the new organisation. Required when mode='create'. */
  @IsOptional()
  @IsString()
  orgName?: string;
}
