import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { SmsGlobalClient } from './smsglobal.client';

@UseGuards(JwtAuthGuard)
@Controller('smsglobal')
export class SmsGlobalController {
  constructor(private readonly smsglobal: SmsGlobalClient) {}

  @Post('test-send')
  async testSend(@Body() body: { to: string; message: string }) {
    // Basic validation (tighten later)
    if (!body?.to?.trim()) throw new Error('Missing "to"');
    if (!body?.message?.trim()) throw new Error('Missing "message"');

    return this.smsglobal.sendSms(body.to.trim(), body.message.trim());
  }
}