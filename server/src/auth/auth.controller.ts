import { Body, Controller, Post, Get, UseGuards, Req, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { DeviceLoginDto } from './dto/device-login.dto';

@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private readonly authService: AuthService) {
        console.log('✅ AuthService injected:', !!authService);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: any) {
        return req.user;
    }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.buildingCode, dto.email, dto.password, dto.deviceId, dto.platform);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto.buildingCode, dto.email, dto.password);
    }

    @Post('device-login')
    deviceLogin(@Body() dto: DeviceLoginDto) {
        return this.authService.deviceLogin(dto.buildingCode, dto.deviceId);
    }
}
