import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ReqUser } from '../auth/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

    async getMe(user: ReqUser) {
        const found = await this.prisma.user.findUnique({ where: { id: user.userId } });
        if (!found) throw new NotFoundException('User not found');
        return { id: found.id, email: found.email, displayName: found.displayName };
    }

    async updateMe(user: ReqUser, dto: UpdateUserDto) {
        const found = await this.prisma.user.findUnique({ where: { id: user.userId } });
        if (!found) throw new NotFoundException('User not found');
        const updated = await this.prisma.user.update({
            where: { id: user.userId },
            data: { displayName: dto.displayName },
        });
        return { id: updated.id, email: updated.email, displayName: updated.displayName };
    }

    async changePassword(user: ReqUser, dto: ChangePasswordDto) {
        const found = await this.prisma.user.findUnique({ where: { id: user.userId } });
        if (!found) throw new NotFoundException('User not found');
        const valid = await bcrypt.compare(dto.currentPassword, found.passwordHash);
        if (!valid) throw new BadRequestException('Current password is incorrect');
        const hash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({ where: { id: user.userId }, data: { passwordHash: hash } });
        return { ok: true };
    }
}