import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { OrgsService } from './orgs.service';
import { UpdateOrgDto } from './dto/update-org.dto';

@UseGuards(JwtAuthGuard)
@Controller('orgs')
export class OrgsController {
    constructor(private svc: OrgsService) {}

    @Get('me')
    getMe(@CurrentUser() user: ReqUser) {
        return this.svc.getMe(user);
    }

    @Patch('me')
    updateMe(@CurrentUser() user: ReqUser, @Body() dto: UpdateOrgDto) {
        return this.svc.updateMe(user, dto);
    }

    @Get('me/members')
    getMembers(@CurrentUser() user: ReqUser) {
        return this.svc.getMembers(user);
    }
}
