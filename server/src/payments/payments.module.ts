import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsWebhookController } from './payments.webhook';

@Module({
    imports: [PrismaModule],
    controllers: [PaymentsController, PaymentsWebhookController],
    providers: [PaymentsService],
})
export class PaymentsModule {}