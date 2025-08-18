import { IsString, IsOptional } from 'class-validator';
export class CreateGroupDto {
    @IsString() name!: string;
    @IsOptional() @IsString() description?: string;
}