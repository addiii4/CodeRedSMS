import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
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

  // ✅ THIS FIXES YOUR ERROR
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

  // ✅ STRIPE SUCCESS HANDLER (NO WEBHOOK)
  @Get('success')
  async success(
    @Query('orgId') orgId: string,
    @Query('credits') credits: string
  ) {
    await this.svc.creditOrg(orgId, parseInt(credits));

    return {
      success: true,
      message: 'Credits added successfully. You can return to the app.',
    };
  }
}