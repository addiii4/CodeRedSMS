import { Body, Controller, Get, Param, Post, Req, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { EstimateDto } from './dto/estimate.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
    // DI-free singletons (stable for MVP)
    private readonly jwt = new JwtService({
        secret: process.env.JWT_SECRET || 'dev-secret',
        signOptions: { expiresIn: process.env.JWT_EXPIRES || '15m' }
    });
    private readonly svc = new MessagesService();

    private getAuth(req: any) {
        const auth = req.headers?.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (!token) throw new BadRequestException('Missing token');
        const payload = this.jwt.verify(token) as { sub: string; orgId: string; role: string };
        return { userId: payload.sub, orgId: payload.orgId, role: payload.role };
    }

    @Post('estimate')
    async estimate(@Body() dto: EstimateDto) {
        return this.svc.estimate(dto?.body || '');
    }

    @Post()
    async create(@Req() req: any, @Body() dto: CreateMessageDto) {
        const { userId, orgId } = this.getAuth(req);
        const scheduledAt = dto?.scheduledAt ? new Date(dto.scheduledAt) : null;
        return this.svc.createMessage({
            orgId,
            authorId: userId,
            title: dto?.title || '',
            body: dto?.body || '',
            groupIds: dto?.groupIds || [],
            contactIds: dto?.contactIds || [],
            adHocNumbers: dto?.adHocNumbers || [],
            scheduledAt
        });
    }

    @Get()
    async list(@Req() req: any) {
        const { orgId } = this.getAuth(req);
        return this.svc.list(orgId);
    }

    @Get(':id')
    async detail(@Req() req: any, @Param('id') id: string) {
        const { orgId } = this.getAuth(req);
        return this.svc.detail(orgId, id);
    }
}