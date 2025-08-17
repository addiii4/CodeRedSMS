import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    constructor(
        private users: UsersService,
        private orgs: OrgsService,
        private jwt: JwtService
    ) {}

    async login(buildingCode: string, email: string, password: string) {
        const org = await this.orgs.findByCode(buildingCode);
        if (!org) throw new UnauthorizedException('Invalid building code');

        const user = await this.users.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        const membership = await this.users.findMembership(user.id, org.id);
        if (!membership) throw new UnauthorizedException('Not a member of this org');

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            orgId: org.id,
            role: membership.role
        });

        return {
            accessToken,
            user: { id: user.id, email: user.email, displayName: user.displayName },
            org: { id: org.id, code: org.code, name: org.name, credits: org.credits }
        };
    }
}