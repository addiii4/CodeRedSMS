import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BulkContactRowDto {
    @IsString()
    fullName!: string;

    @IsString()
    phoneE164!: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    groupNames?: string[];
}

export class BulkImportDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkContactRowDto)
    rows!: BulkContactRowDto[];
}
