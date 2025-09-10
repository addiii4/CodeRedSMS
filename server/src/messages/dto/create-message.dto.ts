export class CreateMessageDto {
    title!: string;
    body!: string;
    groupIds?: string[];
    contactIds?: string[];
    adHocNumbers?: string[];       // optional E.164 numbers
    scheduledAt?: string | null;   // ISO string or null
}