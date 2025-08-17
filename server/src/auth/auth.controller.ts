import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AuthController {
    @Get()
    ok() {
        return { ok: true, ts: new Date().toISOString() };
    }
}