import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

type Role = 'admin' | 'editor' | 'viewer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {
  console.log('🔧 AuthService constructed — Prisma is:', !!prisma);
}

  private sign(p: { userId: string; orgId: string; email?: string; role?: Role }) {
    return this.jwt.sign({
      sub: p.userId,
      orgId: p.orgId,
      email: p.email,
      role: p.role ?? 'editor',
    });
  }

  async register(buildingCode: string, email: string, password: string, deviceId: string, platform?: string) {
    if (!buildingCode || !email || !password || !deviceId) {
      throw new BadRequestException('Missing required fields');
    }

    const org = await this.prisma.organization.upsert({
      where: { code: buildingCode },
      update: {},
      create: { code: buildingCode, name: buildingCode },
    });

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, displayName: email.split('@')[0] },
    });

    const memberCount = await this.prisma.membership.count({ where: { orgId: org.id } });
    const role: Role = memberCount === 0 ? 'admin' : 'editor';

    await this.prisma.membership.create({ data: { userId: user.id, orgId: org.id, role } });

    await this.prisma.device.upsert({
      where: { orgId_deviceId: { orgId: org.id, deviceId } },
      update: { userId: user.id, platform: platform ?? null, lastSeenAt: new Date() },
      create: { orgId: org.id, userId: user.id, deviceId, platform: platform ?? null },
    });

    const accessToken = this.sign({ userId: user.id, orgId: org.id, role });
    return {
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName },
      org: { id: org.id, code: org.code, name: org.name },
    };
  }

  async login(buildingCode: string, email: string, password: string) {
    if (!buildingCode || !email || !password) {
      throw new BadRequestException('Missing required fields');
    }

    const org = await this.prisma.organization.findUnique({ where: { code: buildingCode } });
    if (!org) throw new UnauthorizedException('Invalid building code');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const membership = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId: user.id, orgId: org.id } },
    });
    if (!membership) throw new UnauthorizedException('No access to this organization');

    const accessToken = this.sign({ userId: user.id, orgId: org.id, role: membership.role as Role });
    return {
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName },
      org: { id: org.id, code: org.code, name: org.name },
    };
  }

  async deviceLogin(buildingCode: string, deviceId: string) {
    if (!buildingCode || !deviceId) {
        throw new BadRequestException('Missing required fields');
    }

    // get the org by building code
    console.log('🔍 [deviceLogin] Looking up organization by code:', buildingCode);
    const org = await this.prisma.organization.findUnique({ where: { code: buildingCode } }); // Line 95 - matches stack trace
    if (!org) {
        console.error('❌ [deviceLogin] No organization found for code:', buildingCode);
        throw new UnauthorizedException('Invalid building code');
    }

    // get the device record
    const device = await this.prisma.device.findUnique({
        where: { orgId_deviceId: { orgId: org.id, deviceId } },
    });
    if (!device || !device.userId) {
        throw new UnauthorizedException('Device not registered');
    }

    // get the user attached to that device
    const user = await this.prisma.user.findUnique({ where: { id: device.userId } });
    if (!user) throw new UnauthorizedException('User not found for device');

    // get the membership for that user in that org, include the org details
    const membership = await this.prisma.membership.findFirst({
        where: { userId: user.id, orgId: org.id },
        include: { org: true },
    });
    if (!membership || !membership.org) {
        throw new UnauthorizedException('No access to this organization');
    }

    // sign the token with the orgId and role
    const accessToken = this.sign({
        userId: user.id,
        orgId: membership.org.id,
        role: membership.role as Role,
    });

    // return token + user + org
    return {
        accessToken,
        user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        },
        org: {
        id: membership.org.id,
        code: membership.org.code,
        name: membership.org.name,
        },
    };
    }
}