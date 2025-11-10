import { IsString, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
    name!: string;   // "!" means you promise it will be assigned
    phone!: string;
}