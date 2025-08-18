import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqUser } from '../auth/current-user.decorator';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) {}

    list(user: ReqUser) {
        return this.prisma.contact.findMany({
            where: { orgId: user.orgId },
            orderBy: { createdAt: 'desc' }
        });
    }

    create(user: ReqUser, dto: CreateContactDto) {
        return this.prisma.contact.create({
            data: { orgId: user.orgId, fullName: dto.fullName, phoneE164: dto.phoneE164 }
        });
    }

    async update(user: ReqUser, id: string, dto: UpdateContactDto) {
        const found = await this.prisma.contact.findFirst({ where: { id, orgId: user.orgId } });
        if (!found) throw new NotFoundException();
        return this.prisma.contact.update({
            where: { id },
            data: { ...dto }
        });
    }

    async remove(user: ReqUser, id: string) {
        const found = await this.prisma.contact.findFirst({ where: { id, orgId: user.orgId } });
        if (!found) throw new NotFoundException();
        await this.prisma.contact.delete({ where: { id } });
        return { ok: true };
    }
}