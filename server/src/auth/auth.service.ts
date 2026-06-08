import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

type Role = 'admin' | 'editor' | 'viewer';

const DEFAULT_TEMPLATES = [
  { title: 'Fire Evacuation', body: '🚨 FIRE ALARM activated. Please evacuate the building immediately via your nearest exit. Do not use lifts. Wait at the assembly point.' },
  { title: 'Severe Weather Warning', body: '⚠️ Severe weather warning for our area. Please remain indoors, secure outdoor items and avoid travel until further notice.' },
  { title: 'Emergency Lockdown', body: '🚨 LOCKDOWN in effect. Lock all doors, stay away from windows and remain in place until you receive the all-clear message.' },
  { title: 'Maintenance Notice', body: 'Scheduled maintenance will occur shortly. Some services may be briefly unavailable. We apologise for any inconvenience.' },
  { title: 'All Clear', body: '✅ ALL CLEAR. The situation has been resolved and you may resume normal activities. Thank you for your cooperation.' },
];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Sign a 30-day JWT. orgId may be empty if the user has no active org yet. */
  private sign(p: { userId: string; orgId: string; email?: string; role?: Role }) {
    return this.jwt.sign(
      { sub: p.userId, orgId: p.orgId, email: p.email, role: p.role ?? 'editor' },
      { expiresIn: process.env.JWT_EXPIRES || '30d' },
    );
  }

  private session(user: { id: string; email: string; displayName: string }, accessToken: string) {
    return { accessToken, user: { id: user.id, email: user.email, displayName: user.displayName } };
  }

  /**
   * Two registration paths driven by the `mode` field:
   *
   *   mode = 'join'   → user wants to join an EXISTING org.
   *                      Org must exist + be active. Membership starts as
   *                      'pending' → an org admin approves them.
   *
   *   mode = 'create' → user wants to spin up a NEW org.
   *                      Org starts as 'pending' (awaiting super-admin approval),
   *                      membership starts as 'pending' too. Super-admin approval
   *                      activates both, grants welcome credits + seeds templates,
   *                      and promotes the user to admin.
   */
  async register(p: {
    mode: 'join' | 'create';
    email: string;
    password: string;
    displayName?: string;
    buildingCode: string;
    orgName?: string;
  }) {
    if (!p.email || !p.password) throw new BadRequestException('Email and password required');
    if (!p.buildingCode) throw new BadRequestException('Building code required');
    if (p.password.length < 6) throw new BadRequestException('Password must be at least 6 characters');

    const email = p.email.trim().toLowerCase();
    const buildingCode = p.buildingCode.trim().toUpperCase();

    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new BadRequestException('Email already registered');
    }

    const existingOrg = await this.prisma.organization.findUnique({ where: { code: buildingCode } });

    if (p.mode === 'join') {
      if (!existingOrg) throw new BadRequestException('No organisation found with that building code');
      if (existingOrg.status !== 'active') throw new BadRequestException('Organisation is not active yet');

      const user = await this.createUser(email, p.password, p.displayName);
      await this.prisma.membership.create({
        data: { userId: user.id, orgId: existingOrg.id, role: 'editor', status: 'pending' },
      });

      const accessToken = this.sign({ userId: user.id, orgId: existingOrg.id, email: user.email, role: 'editor' });
      return this.session(user, accessToken);
    }

    // mode === 'create'
    if (existingOrg) throw new BadRequestException('Building code already taken');
    if (!p.orgName?.trim()) throw new BadRequestException('Organisation name required');

    const org = await this.prisma.organization.create({
      data: { code: buildingCode, name: p.orgName.trim(), status: 'pending' },
    });
    const user = await this.createUser(email, p.password, p.displayName);
    await this.prisma.membership.create({
      data: { userId: user.id, orgId: org.id, role: 'admin', status: 'pending' },
    });

    const accessToken = this.sign({ userId: user.id, orgId: org.id, email: user.email, role: 'admin' });
    return this.session(user, accessToken);
  }

  private async createUser(email: string, password: string, displayName?: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, passwordHash, displayName: displayName?.trim() || email.split('@')[0] },
    });
  }

  /** Email + password login. No building code, no device fingerprint. */
  async login(email: string, password: string) {
    if (!email || !password) throw new BadRequestException('Email and password required');
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Find the user's first ACTIVE membership for the JWT orgId.
    // If none are active yet (pending), still issue a token but with an empty
    // orgId — the frontend uses /auth/me to learn this and shows a pending screen.
    const activeMembership = await this.prisma.membership.findFirst({
      where: { userId: user.id, status: 'active' },
      include: { org: true },
    });

    const accessToken = this.sign({
      userId: user.id,
      orgId: activeMembership?.orgId ?? '',
      email: user.email,
      role: (activeMembership?.role as Role) ?? 'viewer',
    });

    return this.session(user, accessToken);
  }

  /** Full account snapshot — user + all memberships and their statuses. */
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { org: { select: { id: true, code: true, name: true, status: true, credits: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!user) throw new UnauthorizedException('User not found');

    return {
      user: { id: user.id, email: user.email, displayName: user.displayName },
      memberships: user.memberships.map((m) => ({
        id: m.id,
        role: m.role,
        status: m.status,
        org: m.org,
      })),
    };
  }

  async verifyPassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Incorrect password');
    return { ok: true };
  }

  /** Reset password: email-only lookup (no building code). */
  async forgotPassword(email: string, newPassword: string) {
    if (!email || !newPassword) throw new BadRequestException('Email and password required');
    if (newPassword.length < 6) throw new BadRequestException('Password must be at least 6 characters');

    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    // Same response regardless to prevent enumeration
    if (!user) return { ok: true };

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return { ok: true };
  }

  // ── Approval flow used by Org Admins ──────────────────────────────────────

  async approveMembership(actorUserId: string, membershipId: string) {
    const m = await this.getMembershipWithActorCheck(actorUserId, membershipId);
    return this.prisma.membership.update({ where: { id: m.id }, data: { status: 'active' } });
  }

  async rejectMembership(actorUserId: string, membershipId: string) {
    const m = await this.getMembershipWithActorCheck(actorUserId, membershipId);
    await this.prisma.membership.delete({ where: { id: m.id } });
    return { ok: true };
  }

  async updateMembershipRole(actorUserId: string, membershipId: string, role: Role) {
    if (!['admin', 'editor', 'viewer'].includes(role)) throw new BadRequestException('Invalid role');
    const m = await this.getMembershipWithActorCheck(actorUserId, membershipId);
    return this.prisma.membership.update({ where: { id: m.id }, data: { role } });
  }

  /** Verifies the acting user is an admin in the org of the target membership. */
  private async getMembershipWithActorCheck(actorUserId: string, membershipId: string) {
    const m = await this.prisma.membership.findUnique({ where: { id: membershipId } });
    if (!m) throw new BadRequestException('Membership not found');

    const actor = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId: actorUserId, orgId: m.orgId } },
    });
    if (!actor || actor.role !== 'admin' || actor.status !== 'active') {
      throw new UnauthorizedException('Only org admins can do this');
    }
    return m;
  }

  // ── Seeding (called by super-admin org-approval flow) ─────────────────────

  /**
   * Grants new-org welcome perks: 20 credits + 5 default templates.
   * Idempotent guard — does nothing if templates already exist.
   */
  async seedNewOrg(orgId: string) {
    const existingTemplates = await this.prisma.template.count({ where: { orgId } });
    if (existingTemplates > 0) return;

    await this.prisma.$transaction([
      this.prisma.organization.update({
        where: { id: orgId },
        data: { credits: { increment: 20 } },
      }),
      this.prisma.creditsLedger.create({
        data: { orgId, type: 'credit', amount: 20, reason: 'Welcome bonus — 20 free credits' },
      }),
      this.prisma.template.createMany({ data: DEFAULT_TEMPLATES.map((t) => ({ orgId, ...t })) }),
    ]);
  }
}
