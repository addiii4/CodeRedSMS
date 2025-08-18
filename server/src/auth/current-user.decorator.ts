import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type ReqUser = { userId: string; orgId: string; role: 'admin'|'editor'|'viewer' };

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): ReqUser => {
        const req = ctx.switchToHttp().getRequest();
        return req.user as ReqUser;
    }
);