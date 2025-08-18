import { IsString } from 'class-validator';

export class DeviceLoginDto {
    @IsString()
    buildingCode!: string;

    @IsString()
    deviceId!: string;
}