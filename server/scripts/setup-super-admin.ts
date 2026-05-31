/**
 * Super Admin Setup
 * -----------------
 * Run with: npm run admin:setup
 *
 * Prompts for an email + password and creates (or resets the password of)
 * a super-admin user. The user is automatically added to a system "SYSADMIN"
 * organization so the JWT system has an orgId to attach.
 *
 * After running this:
 *   1. Add the email to SUPER_ADMIN_EMAILS in your .env
 *   2. Restart the server
 *   3. Open /admin/ and log in with the email + password
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

function ask(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    console.log('\n🔧  Super Admin Setup\n');

    const email = (await ask('Email: ')).trim().toLowerCase();
    if (!email || !email.includes('@')) {
        console.error('❌  Invalid email');
        process.exit(1);
    }

    const password = (await ask('New password (min 6 chars): ')).trim();
    if (password.length < 6) {
        console.error('❌  Password must be at least 6 characters');
        process.exit(1);
    }

    const displayName = (await ask('Display name (or leave blank): ')).trim() || email.split('@')[0];

    const passwordHash = await bcrypt.hash(password, 10);

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        await prisma.user.update({
            where: { email },
            data: { passwordHash, displayName },
        });
        console.log(`\n✅  Password updated for existing user: ${email}`);
    } else {
        user = await prisma.user.create({
            data: { email, passwordHash, displayName },
        });
        console.log(`\n✅  Created new super-admin user: ${email}`);
    }

    // Ensure the user belongs to a system org so JWTs have an orgId attached
    let sysOrg = await prisma.organization.findUnique({ where: { code: 'SYSADMIN' } });
    if (!sysOrg) {
        sysOrg = await prisma.organization.create({
            data: { code: 'SYSADMIN', name: 'System Admin', credits: 0 },
        });
        console.log('   Created system "SYSADMIN" organization');
    }

    const existingMembership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId: user.id, orgId: sysOrg.id } },
    });
    if (!existingMembership) {
        await prisma.membership.create({
            data: { userId: user.id, orgId: sysOrg.id, role: 'admin' },
        });
        console.log('   Linked user to SYSADMIN org');
    }

    console.log('\n📝  Next steps:');
    console.log(`    1. Make sure your .env contains:`);
    console.log(`         SUPER_ADMIN_EMAILS="${email}"`);
    console.log(`    2. Restart the server`);
    console.log(`    3. Open  http://localhost:3000/admin/`);
    console.log(`       (or your hosted URL + /admin/)`);
    console.log(`    4. Log in with this email + password\n`);

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error('❌  Setup failed:', err);
    prisma.$disconnect();
    process.exit(1);
});
