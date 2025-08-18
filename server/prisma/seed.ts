import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function run() {
    const org = await prisma.organization.upsert({
        where: { code: 'RED123' },
        update: {},
        create: {
            code: 'RED123',
            name: 'Code Red HQ',
            credits: 500
        }
    });

    const adminEmail = 'admin@codered.test';
    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            displayName: 'Admin',
            passwordHash: await argon2.hash('password123')
        }
    });

    await prisma.membership.upsert({
        where: { userId_orgId: { userId: user.id, orgId: org.id } },
        update: { role: Role.admin },
        create: { userId: user.id, orgId: org.id, role: Role.admin }
    });

    console.log('Seed complete:', { buildingCode: org.code, email: adminEmail, password: 'password123' });
}

run().finally(() => prisma.$disconnect());