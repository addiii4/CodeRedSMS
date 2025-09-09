import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

type Role = 'admin' | 'editor' | 'viewer';

@Injectable()
export class AuthService {
    // HOTFIX: direct clients so nothing can be undefined at runtime
    private readonly prisma = new PrismaClient();
    private readonly jwt = new JwtService({
        secret: process.env.JWT_SECRET || 'dev-secret',
        signOptions: { expiresIn: process.env.JWT_EXPIRES || '15m' },
    });

    // no constructor needed anymore
    // constructor() {}
    private sign(userId: string, orgId: string, role: Role) {
        return this.jwt.sign({ sub: userId, orgId, role });
    }

    /**
     * First-time signup: create/find org, create user, attach membership, bind device
     */
    async register(
        buildingCode: string,
        email: string,
        password: string,
        deviceId: string,
        platform?: string
    ) {
        if (!buildingCode || !email || !password || !deviceId) {
            throw new BadRequestException('Missing required fields');
        }

        // find or create org by building code
        const org = await this.prisma.organization.upsert({
            where: { code: buildingCode },
            update: {},
            create: {
                code: buildingCode,
                name: buildingCode
            }
        });

        // unique email
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new BadRequestException('Email already registered');

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                displayName: email.split('@')[0]
            }
        });

        // first member of org becomes admin
        const memberCount = await this.prisma.membership.count({ where: { orgId: org.id } });
        const role: Role = memberCount === 0 ? 'admin' : 'editor';

        await this.prisma.membership.create({
            data: { userId: user.id, orgId: org.id, role }
        });

        // bind device to user+org (upsert on (orgId, deviceId))
        await this.prisma.device.upsert({
            where: { orgId_deviceId: { orgId: org.id, deviceId } },
            update: { userId: user.id, platform: platform ?? null, lastSeenAt: new Date() },
            create: { orgId: org.id, userId: user.id, deviceId, platform: platform ?? null }
        });

        const accessToken = this.sign(user.id, org.id, role);
        return {
            accessToken,
            user: { id: user.id, email: user.email, displayName: user.displayName },
            org: { id: org.id, code: org.code, name: org.name }
        };
    }

    /**
     * Email/password login into a specific org
     */
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
            where: { userId_orgId: { userId: user.id, orgId: org.id } }
        });
        if (!membership) throw new UnauthorizedException('No access to this organization');

        const accessToken = this.sign(user.id, org.id, membership.role as Role);
        return {
            accessToken,
            user: { id: user.id, email: user.email, displayName: user.displayName },
            org: { id: org.id, code: org.code, name: org.name }
        };
    }

    /**
     * Fast device login (no email/password)
     */
    async deviceLogin(buildingCode: string, deviceId: string) {
        if (!buildingCode || !deviceId) {
            throw new BadRequestException('Missing required fields');
        }

        const org = await this.prisma.organization.findUnique({ where: { code: buildingCode } });
        if (!org) throw new UnauthorizedException('Invalid building code');

        const device = await this.prisma.device.findUnique({
            where: { orgId_deviceId: { orgId: org.id, deviceId } }
        });
        if (!device || !device.userId) throw new UnauthorizedException('Device not registered');

        const user = await this.prisma.user.findUnique({ where: { id: device.userId } });
        if (!user) throw new UnauthorizedException('User not found for device');

        const membership = await this.prisma.membership.findUnique({
            where: { userId_orgId: { userId: user.id, orgId: org.id } }
        });
        if (!membership) throw new UnauthorizedException('No access to this organization');

        const accessToken = this.sign(user.id, org.id, membership.role as Role);
        return {
            accessToken,
            user: { id: user.id, email: user.email, displayName: user.displayName },
            org: { id: org.id, code: org.code, name: org.name }
        };
    }
}