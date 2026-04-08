import { Injectable, BadRequestException } from '@nestjs/common';
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
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        orgId,
        credits: String(credits),
      },
      success_url: `http://localhost:3000/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `coderedsms://buy-credits?status=cancel`,
    });

    return { url: session.url };
  }

  async handleSuccessfulCheckout(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    const orgId = session.metadata?.orgId;
    const credits = parseInt(session.metadata?.credits || '0', 10);

    if (!orgId || !credits) {
      throw new BadRequestException('Missing payment metadata');
    }

    const existing = await this.prisma.creditsLedger.findFirst({
      where: { stripePaymentId: session.id },
      select: { id: true },
    });

    if (existing) {
      return { ok: true, alreadyProcessed: true };
    }

    const amountPaid =
      typeof session.amount_total === 'number'
        ? (session.amount_total / 100).toFixed(2)
        : '0.00';

    await this.prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: orgId },
        data: {
          credits: { increment: credits },
        },
      });

      await tx.creditsLedger.create({
        data: {
          orgId,
          type: 'credit',
          amount: credits,
          reason: `Stripe purchase · $${amountPaid}`,
          stripePaymentId: session.id,
        },
      });
    });

    return { ok: true };
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
      select: {
        id: true,
        amount: true,
        reason: true,
        stripePaymentId: true,
        createdAt: true,
      },
    });

    return { items };
  }
}