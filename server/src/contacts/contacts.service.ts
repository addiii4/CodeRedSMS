import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqUser } from '../auth/current-user.decorator';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { BulkImportDto } from './dto/bulk-import.dto';

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

    async bulkImport(dto: BulkImportDto, user: ReqUser) {
        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const row of dto.rows) {
            try {
                // Upsert contact — skip if same phone already exists in org
                const existing = await this.prisma.contact.findFirst({
                    where: { orgId: user.orgId, phoneE164: row.phoneE164.trim() },
                });

                let contact = existing;
                if (!existing) {
                    contact = await this.prisma.contact.create({
                        data: {
                            fullName: row.fullName.trim(),
                            phoneE164: row.phoneE164.trim(),
                            orgId: user.orgId,
                        },
                    });
                    imported++;
                } else {
                    skipped++;
                }

                // Handle group membership
                if (row.groupNames && row.groupNames.length > 0 && contact) {
                    for (const rawName of row.groupNames) {
                        const name = rawName.trim();
                        if (!name) continue;

                        // Find or create group
                        let group = await this.prisma.group.findFirst({
                            where: { orgId: user.orgId, name },
                        });
                        if (!group) {
                            group = await this.prisma.group.create({
                                data: { name, orgId: user.orgId },
                            });
                        }

                        // Add to group if not already a member
                        const memberExists = await this.prisma.groupMember.findFirst({
                            where: { groupId: group.id, contactId: contact.id },
                        });
                        if (!memberExists) {
                            await this.prisma.groupMember.create({
                                data: { groupId: group.id, contactId: contact.id },
                            });
                        }
                    }
                }
            } catch (err: any) {
                errors.push(`Row "${row.fullName}" (${row.phoneE164}): ${err?.message ?? 'unknown error'}`);
            }
        }

        return { imported, skipped, errors };
    }

    async remove(id: string, user: ReqUser) {
        try {
            const contact = await this.prisma.contact.findUnique({ where: { id } });

            if (!contact || contact.orgId !== user.orgId) {
            throw new ForbiddenException('Access denied');
            }

            await this.prisma.contact.delete({ where: { id } });
            return { ok: true };
        } catch (err) {
            console.error('Delete Contact Error:', err);
            throw new InternalServerErrorException('Failed to delete contact');
        }
    }
}