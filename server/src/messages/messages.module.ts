import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SmsGlobalModule } from '../smsglobal/smsglobal.module';

@Module({
    imports: [PrismaModule, SmsGlobalModule],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule {}