import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { MessagesService } from './messages.service';
import { EstimateDto } from './dto/estimate.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  @Post('estimate')
  async estimate(@Body() dto: EstimateDto) {
    return this.svc.estimate(dto?.body || '');
  }

  @Post()
  async create(@CurrentUser() user: ReqUser, @Body() dto: CreateMessageDto) {
    const scheduledAt = dto?.scheduledAt ? new Date(dto.scheduledAt) : null;

    return this.svc.createMessage({
      orgId: user.orgId,
      authorId: user.userId,
      title: dto?.title || '',
      body: dto?.body || '',
      groupIds: dto?.groupIds || [],
      contactIds: dto?.contactIds || [],
      adHocNumbers: dto?.adHocNumbers || [],
      scheduledAt
    });
  }

  @Get()
  async list(@CurrentUser() user: ReqUser) {
    return this.svc.list(user.orgId);
  }

  @Get(':id')
  async detail(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.svc.detail(user.orgId, id);
  }
}