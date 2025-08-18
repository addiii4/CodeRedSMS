import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { MemberDto } from './dto/member.dto';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
    constructor(private svc: GroupsService) {}

    @Get()
    list(@CurrentUser() user: ReqUser) { return this.svc.list(user); }

    @Post()
    create(@CurrentUser() user: ReqUser, @Body() dto: CreateGroupDto) {
        return this.svc.create(user, dto);
    }

    @Patch(':id')
    update(@CurrentUser() user: ReqUser, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
        return this.svc.update(user, id, dto);
    }

    @Delete(':id')
    remove(@CurrentUser() user: ReqUser, @Param('id') id: string) {
        return this.svc.remove(user, id);
    }

    @Post(':id/members')
    addMember(@CurrentUser() user: ReqUser, @Param('id') groupId: string, @Body() dto: MemberDto) {
        return this.svc.addMember(user, groupId, dto);
    }

    @Delete(':id/members')
    removeMember(@CurrentUser() user: ReqUser, @Param('id') groupId: string, @Body() dto: MemberDto) {
        return this.svc.removeMember(user, groupId, dto);
    }
}