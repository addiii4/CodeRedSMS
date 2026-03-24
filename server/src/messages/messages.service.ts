import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsGlobalClient } from '../smsglobal/smsglobal.client';

function countSegments(body: string): number {
  if (!body) return 1;
  const len = body.length;
  if (len <= 160) return 1;
  return Math.ceil(len / 153);
}

@Injectable()
export class MessagesService implements OnModuleInit, OnModuleDestroy {
  private poller: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsglobal: SmsGlobalClient,
  ) {}

  onModuleInit() {
    this.poller = setInterval(() => {
      this.processDueMessages().catch((err) => {
        console.error('Scheduled message worker error:', err);
      });
    }, 15000); // every 15 sec
  }

  onModuleDestroy() {
    if (this.poller) clearInterval(this.poller);
  }

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

    const phones = new Set<string>();

    if (params.groupIds?.length) {
      const members = await this.prisma.groupMember.findMany({
        where: { groupId: { in: params.groupIds } },
        select: {
          contact: { select: { id: true, phoneE164: true } },
        },
      });

      for (const m of members) {
        if (m.contact?.phoneE164) phones.add(m.contact.phoneE164);
      }
    }

    if (params.contactIds?.length) {
      const contacts = await this.prisma.contact.findMany({
        where: { id: { in: params.contactIds }, orgId },
        select: { id: true, phoneE164: true },
      });

      for (const c of contacts) {
        if (c.phoneE164) phones.add(c.phoneE164);
      }
    }

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

    const segs = countSegments(body);
    const totalCost = segs * recipientPhones.length;

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new BadRequestException('Organization not found');

    if ((org.credits ?? 0) < totalCost) {
      throw new HttpException('Insufficient credits', 402 as HttpStatus);
    }

    const scheduledAt = params.scheduledAt ?? null;
    const shouldSchedule = !!scheduledAt && scheduledAt.getTime() > Date.now();

    const result = await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          orgId,
          authorId,
          title,
          body,
          scheduledAt,
          status: 'queued',
        },
      });

      await tx.messageRecipient.createMany({
        data: recipientPhones.map((phone) => ({
          messageId: message.id,
          phoneE164: phone,
          status: 'queued',
        })),
      });

      await tx.organization.update({
        where: { id: orgId },
        data: { credits: (org.credits || 0) - totalCost },
      });

      await tx.creditsLedger.create({
        data: {
          orgId,
          type: 'debit',
          amount: totalCost,
          reason: shouldSchedule
            ? `Scheduled message '${title}' (${recipientPhones.length} recipients × ${segs} seg)`
            : `Message '${title}' (${recipientPhones.length} recipients × ${segs} seg)`,
        },
      });

      return message;
    });

    // If future-scheduled, don't send now.
    if (shouldSchedule) {
      return {
        id: result.id,
        recipients: recipientPhones.length,
        segments: segs,
        cost: totalCost,
        status: 'queued',
        scheduledAt,
      };
    }

    // Otherwise send immediately
    await this.sendMessageNow(result.id);

    return {
      id: result.id,
      recipients: recipientPhones.length,
      segments: segs,
      cost: totalCost,
      status: 'sent',
      scheduledAt,
    };
  }

  private async sendMessageNow(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        recipients: true,
      },
    });

    if (!message) throw new BadRequestException('Message not found');

    await this.prisma.message.update({
      where: { id: messageId },
      data: { status: 'sending' },
    });

    for (const recipient of message.recipients) {
      try {
        const res = await this.smsglobal.sendSms(recipient.phoneE164, message.body);

        const providerMsgId =
          res?.messages?.[0]?.id?.toString?.() ||
          res?.messages?.[0]?.outgoing_id?.toString?.() ||
          null;

        await this.prisma.messageRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'sent',
            providerMsgId,
          },
        });
      } catch (err) {
        await this.prisma.messageRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'failed',
            errorCode: 'SEND_FAILED',
          },
        });
      }
    }

    const recips = await this.prisma.messageRecipient.findMany({
      where: { messageId },
      select: { status: true },
    });

    const hasFailed = recips.some((r) => r.status === 'failed');
    const finalStatus = hasFailed ? 'failed' : 'sent';

    await this.prisma.message.update({
      where: { id: messageId },
      data: { status: finalStatus },
    });
  }

  private async processDueMessages() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const dueMessages = await this.prisma.message.findMany({
        where: {
          status: 'queued',
          scheduledAt: { not: null, lte: new Date() },
        },
        select: { id: true },
        orderBy: { scheduledAt: 'asc' },
      });

      for (const msg of dueMessages) {
        try {
          await this.sendMessageNow(msg.id);
        } catch (err) {
          console.error(`Failed scheduled send for message ${msg.id}`, err);
          await this.prisma.message.update({
            where: { id: msg.id },
            data: { status: 'failed' },
          });
          await this.prisma.messageRecipient.updateMany({
            where: { messageId: msg.id, status: 'queued' },
            data: { status: 'failed', errorCode: 'SCHEDULE_SEND_FAILED' },
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async list(orgId: string) {
    const items = await this.prisma.message.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        scheduledAt: true,
      },
    });

    return { items };
  }

  async detail(orgId: string, id: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, orgId },
      select: {
        id: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
        scheduledAt: true,
      },
    });

    if (!message) throw new BadRequestException('Not found');

    const recips = await this.prisma.messageRecipient.findMany({
      where: { messageId: id },
      select: { status: true },
    });

    const breakdown = recips.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const recipients = recips.length;

    return { ...message, recipients, breakdown };
  }
}