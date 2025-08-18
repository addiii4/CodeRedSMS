import { IsOptional, IsString } from 'class-validator';
export class UpdateTemplateDto {
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() body?: string;
}