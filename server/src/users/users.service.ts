import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    findMembership(userId: string, orgId: string) {
        return this.prisma.membership.findUnique({
            where: { userId_orgId: { userId, orgId } }
        });
    }
}