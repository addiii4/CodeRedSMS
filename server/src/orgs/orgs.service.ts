import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgsService {
    constructor(private prisma: PrismaService) {}
    findByCode(code: string) {
        return this.prisma.organization.findUnique({ where: { code } });
    }
}