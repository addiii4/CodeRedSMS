import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    buildingCode!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    deviceId!: string;

    @IsOptional()
    @IsString()
    platform?: string; // 'ios' | 'android'
}