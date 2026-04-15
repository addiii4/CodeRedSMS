import { Body, Controller, Post, Get, UseGuards, Req, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser, ReqUser } from './current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { DeviceLoginDto } from './dto/device-login.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

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
        return this.authService.login(dto.buildingCode, dto.email, dto.password, dto.deviceId, dto.platform);
    }

    @Post('device-login')
    deviceLogin(@Body() dto: DeviceLoginDto) {
        return this.authService.deviceLogin(dto.buildingCode, dto.deviceId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-password')
    verifyPassword(@CurrentUser() user: ReqUser, @Body() dto: VerifyPasswordDto) {
        return this.authService.verifyPassword(user.userId, dto.password);
    }
}
