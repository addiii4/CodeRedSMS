import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqUser } from '../auth/current-user.decorator';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) {}

    async findAll(user: ReqUser) {
        try {
            return await this.prisma.contact.findMany({
            where: { orgId: user.orgId },
            });
        } catch (err) {
            console.error('Find Contacts Error:', err);
            throw new InternalServerErrorException('Failed to fetch contacts');
        }
    }

    async create(createContactDto: CreateContactDto, user: ReqUser) {
        try {
            console.log('Creating contact for orgId:', user.orgId);
            return await this.prisma.contact.create({
            data: {
                fullName: createContactDto.fullName.trim(),
                phoneE164: createContactDto.phoneE164.trim(),
                orgId: user.orgId,
            },
            });
        } catch (err) {
            console.error('Create Contact Error:', err);
            throw new InternalServerErrorException('Failed to create contact');
        }
    }

    async update(id: string, updateContactDto: UpdateContactDto, user: ReqUser) {
        try {
            const contact = await this.prisma.contact.findUnique({ where: { id } });

            if (!contact || contact.orgId !== user.orgId) {
            throw new ForbiddenException('Access denied');
            }

            return await this.prisma.contact.update({
            where: { id },
            data: updateContactDto,
            });
        } catch (err) {
            console.error('Update Contact Error:', err);
            throw new InternalServerErrorException('Failed to update contact');
        }
    }

    async remove(id: string, user: ReqUser) {
        try {
            const contact = await this.prisma.contact.findUnique({ where: { id } });

            if (!contact || contact.orgId !== user.orgId) {
            throw new ForbiddenException('Access denied');
            }

            return await this.prisma.contact.delete({ where: { id } });
        } catch (err) {
            console.error('Delete Contact Error:', err);
            throw new InternalServerErrorException('Failed to delete contact');
        }
    }
}