import { IsString } from 'class-validator';
export class CreateTemplateDto {
    @IsString() title!: string;
    @IsString() body!: string;
}