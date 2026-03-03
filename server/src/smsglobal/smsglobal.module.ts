import { Module } from '@nestjs/common';
import { SmsGlobalController } from './smsglobal.controller';
import { SmsGlobalClient } from './smsglobal.client';

@Module({
    controllers: [SmsGlobalController],
    providers: [SmsGlobalClient],
})
export class SmsGlobalModule {}