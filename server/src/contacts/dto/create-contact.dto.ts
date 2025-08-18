import { IsString, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
    @IsString() @IsNotEmpty()
    fullName!: string;

    @IsString() @IsNotEmpty()
    phoneE164!: string;
}