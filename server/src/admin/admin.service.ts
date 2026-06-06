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

    // Super-admin tokens live longer (24h) than user tokens (1h) so admins
    // don't get kicked out every hour while monitoring the dashboard.
    const accessToken = this.jwt.sign(
      { sub: user.id, orgId: membership.orgId, email: user.email, role: 'super_admin' },
      { expiresIn: '24h' },
    );

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

    // Health classification per org. Drives the colour badge in the admin UI.
    //   red    = out of credits (0) — can't send any messages
    //   yellow = low credits (< 20) — running low, should top up
    //   green  = healthy
    // SYSADMIN org is always shown as 'system' so admins know it's the internal one.
    return orgs.map((o) => {
      let health: 'green' | 'yellow' | 'red' | 'system' = 'green';
      if (o.code === 'SYSADMIN') health = 'system';
      else if (o.credits <= 0) health = 'red';
      else if (o.credits < 20) health = 'yellow';
      return { ...o, health };
    });
  }

  async updateOrg(orgId: string, data: { name?: string }) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new BadRequestException('Org not found');
    if (org.code === 'SYSADMIN') throw new BadRequestException('Cannot modify the system admin org');

    return this.prisma.organization.update({
      where: { id: orgId },
      data: { name: data.name?.trim() || org.name },
    });
  }

  async deleteOrg(orgId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new BadRequestException('Org not found');
    if (org.code === 'SYSADMIN') throw new BadRequestException('Cannot delete the system admin org');

    // onDelete: Cascade on all relations means a single delete wipes contacts,
    // groups, messages, memberships, devices, templates, ledger entries.
    await this.prisma.organization.delete({ where: { id: orgId } });
    return { ok: true };
  }

  async updateUser(userId: string, data: { displayName?: string; email?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const updates: { displayName?: string; email?: string } = {};
    if (data.displayName?.trim()) updates.displayName = data.displayName.trim();
    if (data.email?.trim()) updates.email = data.email.trim().toLowerCase();

    if (Object.keys(updates).length === 0) return user;
    return this.prisma.user.update({ where: { id: userId }, data: updates });
  }

  async deleteUser(userId: string, actorEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Never allow deletion of any super-admin (themselves or other admins)
    const allowlist = (process.env.SUPER_ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (allowlist.includes(user.email.toLowerCase())) {
      throw new BadRequestException('Cannot delete a super-admin account');
    }

    await this.prisma.user.delete({ where: { id: userId } });
    console.log(`[admin] ${actorEmail} deleted user ${user.email}`);
    return { ok: true };
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
