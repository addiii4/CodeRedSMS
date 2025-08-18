import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { DeviceLoginDto } from './dto/device-login.dto';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    // First-time signup (register device)
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto.buildingCode, dto.email, dto.password, dto.deviceId, dto.platform);
    }

    // Traditional login (email/pass)
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto.buildingCode, dto.email, dto.password);
    }

    // Subsequent fast login (buildingCode + deviceId)
    @Post('device-login')
    deviceLogin(@Body() dto: DeviceLoginDto) {
        return this.auth.deviceLogin(dto.buildingCode, dto.deviceId);
    }
}