import { IsOptional, IsString } from 'class-validator';

export class UpdateContactDto {
    @IsOptional() @IsString()
    fullName?: string;

    @IsOptional() @IsString()
    phoneE164?: string;
}