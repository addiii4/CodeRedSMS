import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private svc: UsersService) {}

    @Get('me')
    getMe(@CurrentUser() user: ReqUser) {
        return this.svc.getMe(user);
    }

    @Patch('me')
    updateMe(@CurrentUser() user: ReqUser, @Body() dto: UpdateUserDto) {
        return this.svc.updateMe(user, dto);
    }

    @Post('me/change-password')
    changePassword(@CurrentUser() user: ReqUser, @Body() dto: ChangePasswordDto) {
        return this.svc.changePassword(user, dto);
    }
}
