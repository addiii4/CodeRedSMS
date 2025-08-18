import { IsString } from 'class-validator';
export class MemberDto { @IsString() contactId!: string; }