import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Super-admin login — email + password only (no building code).
   * The email must be in the SUPER_ADMIN_EMAILS env allowlist AND match a
   * registered user. Returns a JWT that works with the existing auth guards.
   */
  async login(email: string, password: string) {
    const allowlist = (process.env.SUPER_ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const normalizedEmail = (email ?? '').trim().toLowerCase();

    if (!normalizedEmail || !allowlist.includes(normalizedEmail)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password ?? '', user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Pick any membership so the JWT carries an orgId (existing decorators require it).
    // The setup script ensures every super admin belongs to the SYSADMIN org.
    const membership = await this.prisma.membership.findFirst({ where: { userId: user.id } });
    if (!membership) {
      throw new UnauthorizedException(
        'Super-admin user has no org membership — re-run `npm run admin:setup`',
      );
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
      orgId: membership.orgId,
      email: user.email,
      role: 'super_admin',
    });

    return { accessToken, email: user.email };
  }

  async stats() {
    const [orgs, users, totalCreditsAgg, messages, recipientsSent, recipientsFailed] =
      await Promise.all([
        this.prisma.organization.count(),
        this.prisma.user.count(),
        this.prisma.organization.aggregate({ _sum: { credits: true } }),
        this.prisma.message.count(),
        this.prisma.messageRecipient.count({ where: { status: 'sent' } }),
        this.prisma.messageRecipient.count({ where: { status: 'failed' } }),
      ]);

    return {
      orgs,
      users,
      messages,
      recipientsSent,
      recipientsFailed,
      totalCreditsHeld: totalCreditsAgg._sum.credits ?? 0,
    };
  }

  async listOrgs() {
    const orgs = await this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        name: true,
        senderId: true,
        credits: true,
        createdAt: true,
        _count: {
          select: { users: true, contacts: true, messages: true },
        },
      },
    });
    return orgs;
  }

  async orgDetail(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: {
          include: {
            user: { select: { id: true, email: true, displayName: true, createdAt: true } },
          },
        },
      },
    });
    if (!org) throw new BadRequestException('Org not found');

    const ledger = await this.prisma.creditsLedger.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const recentMessages = await this.prisma.message.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        scheduledAt: true,
        _count: { select: { recipients: true } },
      },
    });

    return { org, ledger, recentMessages };
  }

  async listUsers(limit = 200) {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            org: { select: { id: true, code: true, name: true } },
          },
        },
      },
    });
  }

  async listMessages(limit = 100) {
    return this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        scheduledAt: true,
        org: { select: { id: true, code: true, name: true } },
        _count: { select: { recipients: true } },
      },
    });
  }

  async listLedger(limit = 200) {
    return this.prisma.creditsLedger.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        org: { select: { id: true, code: true, name: true } },
      },
    });
  }

  /**
   * Manually adjust an org's credits. amount can be positive or negative.
   * Always logs an entry in the ledger so it's auditable.
   */
  async adjustCredits(orgId: string, amount: number, reason: string, actorEmail: string) {
    if (!Number.isInteger(amount) || amount === 0) {
      throw new BadRequestException('amount must be a non-zero integer');
    }
    if (!reason?.trim()) throw new BadRequestException('reason is required');

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new BadRequestException('Org not found');

    const newCredits = (org.credits ?? 0) + amount;
    if (newCredits < 0) throw new BadRequestException('Adjustment would make credits negative');

    const [, ledgerEntry] = await this.prisma.$transaction([
      this.prisma.organization.update({
        where: { id: orgId },
        data: { credits: newCredits },
      }),
      this.prisma.creditsLedger.create({
        data: {
          orgId,
          type: amount > 0 ? 'credit' : 'debit',
          amount: Math.abs(amount),
          reason: `[admin:${actorEmail}] ${reason.trim()}`,
        },
      }),
    ]);

    return { ok: true, newCredits, ledgerEntryId: ledgerEntry.id };
  }
}
