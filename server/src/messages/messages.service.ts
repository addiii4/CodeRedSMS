import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type Role = 'admin' | 'editor' | 'viewer';

function countSegments(body: string): number {
    // Simple, reliable MVP: 160 for single; 153 for concatenated
    if (!body) return 1;
    const len = body.length;
    if (len <= 160) return 1;
    return Math.ceil(len / 153);
}

@Injectable()
export class MessagesService {
    private readonly prisma = new PrismaClient();

    async estimate(body: string) {
        const segments = countSegments(body || '');
        return { segments };
    }

    async createMessage(params: {
        orgId: string;
        authorId: string;
        title: string;
        body: string;
        groupIds?: string[];
        contactIds?: string[];
        adHocNumbers?: string[];
        scheduledAt?: Date | null;
    }) {
        const { orgId, authorId, title, body } = params;
        if (!orgId || !authorId) throw new BadRequestException('Missing auth context');
        if (!title || !body) throw new BadRequestException('Title and body required');

        // 1) Collect recipients
        const phones = new Set<string>();

        // Contacts from groups
        if (params.groupIds?.length) {
            const members = await this.prisma.groupMember.findMany({
                where: { groupId: { in: params.groupIds } },
                select: {
                    contact: { select: { id: true, phoneE164: true } }
                }
            });
            for (const m of members) {
                if (m.contact?.phoneE164) phones.add(m.contact.phoneE164);
            }
        }

        // Explicit contacts
        if (params.contactIds?.length) {
            const contacts = await this.prisma.contact.findMany({
                where: { id: { in: params.contactIds }, orgId },
                select: { id: true, phoneE164: true }
            });
            for (const c of contacts) {
                if (c.phoneE164) phones.add(c.phoneE164);
            }
        }

        // Ad-hoc numbers
        if (params.adHocNumbers?.length) {
            for (const n of params.adHocNumbers) {
                const trimmed = (n || '').trim();
                if (trimmed) phones.add(trimmed);
            }
        }

        const recipientPhones = Array.from(phones);
        if (recipientPhones.length === 0) {
            throw new BadRequestException('No recipients selected');
        }

        // 2) Credits check
        const segs = countSegments(body);
        const totalCost = segs * recipientPhones.length;

        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!org) throw new BadRequestException('Organization not found');

        if ((org.credits ?? 0) < totalCost) {
            // 402 Payment Required
            throw new HttpException('Insufficient credits', 402 as HttpStatus);
        }

        // 3) Create message + recipients in a tx; decrement credits and write ledger
        const scheduledAt = params.scheduledAt ?? null;

        const result = await this.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: {
                    orgId,
                    authorId,
                    title,
                    body,
                    scheduledAt,
                    status: 'queued' // For MVP: queued; actual sending worker in M5
                }
            });

            // Create recipients
            if (recipientPhones.length) {
                await tx.messageRecipient.createMany({
                    data: recipientPhones.map((phone) => ({
                        messageId: message.id,
                        phoneE164: phone,
                        status: 'queued'
                    }))
                });
            }

            // Decrement credits + ledger entry
            await tx.organization.update({
                where: { id: orgId },
                data: { credits: (org.credits || 0) - totalCost }
            });

            await tx.creditsLedger.create({
                data: {
                    orgId,
                    type: 'debit',
                    amount: totalCost,
                    reason: `Message '${title}' (${recipientPhones.length} recipients × ${segs} seg)`
                }
            });

            return message;
        });

        return { id: result.id, recipients: recipientPhones.length, segments: segs, cost: totalCost };
    }

    async list(orgId: string) {
        const items = await this.prisma.message.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, status: true, createdAt: true, scheduledAt: true }
        });
        return { items };
    }

    async detail(orgId: string, id: string) {
        const message = await this.prisma.message.findFirst({
            where: { id, orgId },
            select: {
                id: true, title: true, body: true, status: true,
                createdAt: true, scheduledAt: true
            }
        });
        if (!message) throw new BadRequestException('Not found');

        const recips = await this.prisma.messageRecipient.findMany({
            where: { messageId: id },
            select: { status: true }
        });

        const breakdown = recips.reduce<Record<string, number>>((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {});
        const recipients = recips.length;

        return { ...message, recipients, breakdown };
    }
}