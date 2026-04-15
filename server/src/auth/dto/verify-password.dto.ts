import { IsString } from 'class-validator';

export class VerifyPasswordDto {
    @IsString()
    password!: string;
}
