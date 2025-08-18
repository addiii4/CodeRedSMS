import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private users: UsersService,
        private orgs: OrgsService,
        private jwt: JwtService,
        private prisma: PrismaService
    ) {}

    private async signAccess(userId: string, orgId: string, role: Role) {
        return this.jwt.signAsync({ sub: userId, orgId, role });
    }

    async login(buildingCode: string, email: string, password: string) {
        const org = await this.orgs.findByCode(buildingCode);
        if (!org) throw new UnauthorizedException('Invalid building code');

        const user = await this.users.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        const membership = await this.users.findMembership(user.id, org.id);
        if (!membership) throw new UnauthorizedException('Not a member of this org');

        const accessToken = await this.signAccess(user.id, org.id, membership.role);

        return {
            accessToken,
            user: { id: user.id, email: user.email, displayName: user.displayName },
            org: { id: org.id, code: org.code, name: org.name, credits: org.credits }
        };
    }

    // First-time signup on a device
    async register(buildingCode: string, email: string, password: string, deviceId: string, platform?: string) {
        const org = await this.orgs.findByCode(buildingCode);
        if (!org) throw new BadRequestException('Invalid building code');

        // Upsert user
        const existing = await this.users.findByEmail(email);
        if (existing) {
            // Ensure they’re not already in this org
            const member = await this.users.findMembership(existing.id, org.id);
            if (!member) {
                await this.prisma.membership.create({
                    data: { userId: existing.id, orgId: org.id, role: Role.editor }
                });
            }
            // Update password if needed? (Optional: skip)
        }

        const user = existing ?? await this.prisma.user.create({
            data: {
                email,
                displayName: email.split('@')[0],
                passwordHash: await argon2.hash(password)
            }
        });

        // Ensure membership
        await this.prisma.membership.upsert({
            where: { userId_orgId: { userId: user.id, orgId: org.id } },
            update: {},
            create: { userId: user.id, orgId: org.id, role: Role.editor }
        });

        // Register device
        await this.prisma.device.upsert({
            where: { orgId_deviceId: { orgId: org.id, deviceId } },
            update: { userId: user.id, platform, lastSeenAt: new Date() },
            create: { orgId: org.id, userId: user.id, deviceId, platform }
        });

        const membership = await this.users.findMembership(user.id, org.id);
        const accessToken = await this.signAccess(user.id, org.id, membership!.role);

        return {
            accessToken,
            user: { id: user.id, email: user.email, displayName: user.displayName },
            org: { id: org.id, code: org.code, name: org.name, credits: org.credits }
        };
    }

    // Subsequent fast login: buildingCode + deviceId
    async deviceLogin(buildingCode: string, deviceId: string) {
        const org = await this.orgs.findByCode(buildingCode);
        if (!org) throw new UnauthorizedException('Invalid building code');

        const device = await this.prisma.device.findUnique({
            where: { orgId_deviceId: { orgId: org.id, deviceId } }
        });
        if (!device || !device.userId) {
            throw new UnauthorizedException('Device not registered for this organization');
        }

        const membership = await this.users.findMembership(device.userId, org.id);
        if (!membership) {
            throw new UnauthorizedException('Not a member');
        }

        // Update last seen
        await this.prisma.device.update({
            where: { orgId_deviceId: { orgId: org.id, deviceId } },
            data: { lastSeenAt: new Date() }
        });

        const accessToken = await this.signAccess(device.userId, org.id, membership.role);

        // fetch user for response
        const user = await this.prisma.user.findUnique({ where: { id: device.userId } });

        return {
            accessToken,
            user: { id: user!.id, email: user!.email, displayName: user!.displayName },
            org: { id: org.id, code: org.code, name: org.name, credits: org.credits }
        };
    }
}