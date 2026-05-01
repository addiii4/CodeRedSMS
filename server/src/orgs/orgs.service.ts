import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqUser } from '../auth/current-user.decorator';
import { UpdateOrgDto } from './dto/update-org.dto';

@Injectable()
export class OrgsService {
    constructor(private prisma: PrismaService) {}

    findByCode(code: string) {
        return this.prisma.organization.findUnique({ where: { code } });
    }

    async getMe(user: ReqUser) {
        const org = await this.prisma.organization.findUnique({ where: { id: user.orgId } });
        if (!org) throw new NotFoundException('Organisation not found');
        return { id: org.id, name: org.name, code: org.code, senderId: org.senderId, credits: org.credits };
    }

    async updateMe(user: ReqUser, dto: UpdateOrgDto) {
        if (user.role !== 'admin') throw new ForbiddenException('Only admins can update organisation settings');
        const org = await this.prisma.organization.findUnique({ where: { id: user.orgId } });
        if (!org) throw new NotFoundException('Organisation not found');
        const data: { name?: string; senderId?: string } = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.senderId !== undefined) data.senderId = dto.senderId;
        const updated = await this.prisma.organization.update({ where: { id: user.orgId }, data });
        return { id: updated.id, name: updated.name, code: updated.code, senderId: updated.senderId, credits: updated.credits };
    }

    async getMembers(user: ReqUser) {
        const memberships = await this.prisma.membership.findMany({
            where: { orgId: user.orgId },
            include: { user: { select: { id: true, email: true, displayName: true } } },
            orderBy: { createdAt: 'asc' },
        });
        return memberships.map(m => ({
            userId: m.userId,
            email: m.user.email,
            displayName: m.user.displayName,
            role: m.role,
            joinedAt: m.createdAt,
        }));
    }
}