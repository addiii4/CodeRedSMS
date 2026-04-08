import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Header,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(
    @CurrentUser() user: ReqUser,
    @Body() dto: { amount: number; credits: number }
  ) {
    return this.svc.createCheckoutSession(user.orgId, dto.amount, dto.credits);
  }

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  balance(@CurrentUser() user: ReqUser) {
    return this.svc.getBalance(user.orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@CurrentUser() user: ReqUser) {
    return this.svc.getHistory(user.orgId);
  }

  @Get('success')
  @Header('Content-Type', 'text/html')
  async success(@Query('session_id') sessionId: string) {
    if (sessionId) {
      await this.svc.handleSuccessfulCheckout(sessionId);
    }

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Payment successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f7f7f7;
              color: #111;
            }
            .card {
              background: white;
              padding: 24px;
              border-radius: 16px;
              box-shadow: 0 8px 30px rgba(0,0,0,0.08);
              text-align: center;
              max-width: 320px;
            }
            h2 { margin: 0 0 12px; }
            p { margin: 0; color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Payment successful</h2>
            <p>You can now return to the app.</p>
          </div>
        </body>
      </html>
    `;
  }
}