import { Body, Controller, Post, InternalServerErrorException, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { DeviceLoginDto } from './dto/device-login.dto';

@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private readonly auth: AuthService) {}

    @Post('register')
    register(@Body() dto: { buildingCode: string; email: string; password: string; deviceId: string; platform?: string; }) {
        return this.auth.register(dto.buildingCode, dto.email, dto.password, dto.deviceId, dto.platform);
    }

    @Post('login')
    login(@Body() dto: { buildingCode: string; email: string; password: string; }) {
        return this.auth.login(dto.buildingCode, dto.email, dto.password);
    }

    @Post('device-login')
    deviceLogin(@Body() dto: { buildingCode: string; deviceId: string; }) {
        return this.auth.deviceLogin(dto.buildingCode, dto.deviceId);
    }
}