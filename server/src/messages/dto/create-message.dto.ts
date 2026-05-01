import { IsArray, IsISO8601, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  adHocNumbers?: string[];

  // @IsOptional() alone does not reliably skip null in all class-validator versions.
  // @ValidateIf explicitly skips ISO validation when the value is null/undefined.
  @ValidateIf((o) => o.scheduledAt != null)
  @IsISO8601()
  scheduledAt?: string | null;
}
