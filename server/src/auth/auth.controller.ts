import { Body, Controller, Post, Get, UseGuards, Inject, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser, ReqUser } from './current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private readonly authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: ReqUser) {
        return this.authService.me(user.userId);
    }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register({
            mode: dto.mode,
            email: dto.email,
            password: dto.password,
            displayName: dto.displayName,
            buildingCode: dto.buildingCode,
            orgName: dto.orgName,
        });
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-password')
    verifyPassword(@CurrentUser() user: ReqUser, @Body() dto: VerifyPasswordDto) {
        return this.authService.verifyPassword(user.userId, dto.password);
    }

    @Post('forgot-password')
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email, dto.newPassword);
    }

    // ── Org-admin approval of pending members ──────────────────────────────

    @UseGuards(JwtAuthGuard)
    @Post('memberships/:id/approve')
    approveMembership(@CurrentUser() user: ReqUser, @Param('id') id: string) {
        return this.authService.approveMembership(user.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('memberships/:id/reject')
    rejectMembership(@CurrentUser() user: ReqUser, @Param('id') id: string) {
        return this.authService.rejectMembership(user.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('memberships/:id/role')
    updateRole(
        @CurrentUser() user: ReqUser,
        @Param('id') id: string,
        @Body() body: { role: 'admin' | 'editor' | 'viewer' },
    ) {
        return this.authService.updateMembershipRole(user.userId, id, body.role);
    }
}
