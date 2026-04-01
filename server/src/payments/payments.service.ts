import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    constructor(private prisma: PrismaService) {}

    async createCheckoutSession(orgId: string, amount: number, credits: number) {
    const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
            price_data: {
                currency: 'aud',
                product_data: {
                name: `${credits} SMS Credits`,
                },
                unit_amount: amount * 100,
            },
            quantity: 1,
            },
        ],
        success_url: `http://localhost:3000/api/payments/success?orgId=${orgId}&credits=${credits}`,
        cancel_url: 'https://example.com/cancel',
    });

    return { url: session.url };
    }

    async creditOrg(orgId: string, credits: number) {
    await this.prisma.organization.update({
        where: { id: orgId },
        data: {
        credits: { increment: credits },
        },
    });

    await this.prisma.creditsLedger.create({
        data: {
        orgId,
        type: 'credit',
        amount: credits,
        reason: 'Stripe purchase',
        },
    });
    }

    async getBalance(orgId: string) {
    const org = await this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { credits: true },
    });

    return { credits: org?.credits ?? 0 };
    }

    async getHistory(orgId: string) {
    const items = await this.prisma.creditsLedger.findMany({
        where: { orgId, type: 'credit' },
        orderBy: { createdAt: 'desc' },
    });

    return { items };
    }
}