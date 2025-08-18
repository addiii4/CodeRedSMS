import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqUser } from '../auth/current-user.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { MemberDto } from './dto/member.dto';

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) {}

    list(user: ReqUser) {
        return this.prisma.group.findMany({
            where: { orgId: user.orgId },
            include: { members: { include: { contact: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    create(user: ReqUser, dto: CreateGroupDto) {
        return this.prisma.group.create({
            data: { orgId: user.orgId, name: dto.name, description: dto.description ?? null }
        });
    }

    async update(user: ReqUser, id: string, dto: UpdateGroupDto) {
        const found = await this.prisma.group.findFirst({ where: { id, orgId: user.orgId } });
        if (!found) throw new NotFoundException();
        return this.prisma.group.update({ where: { id }, data: { ...dto } });
    }

    async remove(user: ReqUser, id: string) {
        const found = await this.prisma.group.findFirst({ where: { id, orgId: user.orgId } });
        if (!found) throw new NotFoundException();
        await this.prisma.group.delete({ where: { id } });
        return { ok: true };
    }

    async addMember(user: ReqUser, groupId: string, dto: MemberDto) {
        const group = await this.prisma.group.findFirst({ where: { id: groupId, orgId: user.orgId } });
        if (!group) throw new NotFoundException('Group not found');
        const contact = await this.prisma.contact.findFirst({ where: { id: dto.contactId, orgId: user.orgId } });
        if (!contact) throw new BadRequestException('Contact not in org');

        await this.prisma.groupMember.upsert({
            where: { groupId_contactId: { groupId, contactId: contact.id } },
            update: {},
            create: { groupId, contactId: contact.id }
        });
        return { ok: true };
    }

    async removeMember(user: ReqUser, groupId: string, dto: MemberDto) {
        const gm = await this.prisma.groupMember.findFirst({
            where: { groupId, contactId: dto.contactId, group: { orgId: user.orgId } }
        });
        if (!gm) throw new NotFoundException();
        await this.prisma.groupMember.delete({ where: { id: gm.id } });
        return { ok: true };
    }
}