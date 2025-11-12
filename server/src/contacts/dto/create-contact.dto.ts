import { IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  fullName!: string;

  @IsString()
  phoneE164!: string;
}