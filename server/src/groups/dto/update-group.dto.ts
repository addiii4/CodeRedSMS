import { IsOptional, IsString } from 'class-validator';
export class UpdateGroupDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() description?: string;
}