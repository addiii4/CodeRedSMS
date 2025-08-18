import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqUser } from '../auth/current-user.decorator';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
    constructor(private prisma: PrismaService) {}

    list(user: ReqUser) {
        return this.prisma.template.findMany({
            where: { orgId: user.orgId },
            orderBy: { updatedAt: 'desc' }
        });
    }

    create(user: ReqUser, dto: CreateTemplateDto) {
        return this.prisma.template.create({
            data: { orgId: user.orgId, title: dto.title, body: dto.body }
        });
    }

    async update(user: ReqUser, id: string, dto: UpdateTemplateDto) {
        const found = await this.prisma.template.findFirst({ where: { id, orgId: user.orgId } });
        if (!found) throw new NotFoundException();
        return this.prisma.template.update({ where: { id }, data: { ...dto } });
    }

    async remove(user: ReqUser, id: string) {
        const found = await this.prisma.template.findFirst({ where: { id, orgId: user.orgId } });
        if (!found) throw new NotFoundException();
        await this.prisma.template.delete({ where: { id } });
        return { ok: true };
    }
}