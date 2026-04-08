import { Controller, Post, Req, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import Stripe from 'stripe';

@Controller('payments/webhook')
export class PaymentsWebhookController {
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    constructor(private svc: PaymentsService) {}

    @Post()
    async handleWebhook(
        @Req() req: any,
        @Headers('stripe-signature') sig: string,
    ) {
        const event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
        );

        if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const orgId = session.metadata?.orgId;
        const credits = parseInt(session.metadata?.credits || '0');

        if (orgId && credits) {
            await this.svc.handleSuccessfulCheckout(session.id);
        }
        }

        return { received: true };
    }
}