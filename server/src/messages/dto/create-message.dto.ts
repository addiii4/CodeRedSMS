import { IsArray, IsISO8601, IsOptional, IsString, ArrayNotEmpty } from 'class-validator';

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

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string | null;
}