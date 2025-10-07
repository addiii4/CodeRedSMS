import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';

export type ReqUser = {
    sub: string;
    email?: string;
    role?: string;
    orgId: string;
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): ReqUser => {
    const req = ctx.switchToHttp().getRequest();
    const u = req?.user;

    if (!u) throw new UnauthorizedException('No user on request');

    const sub = u.sub ?? u.userId ?? u.id;
    const orgId  = u.orgId ?? u.org?.id;

    if (!sub || !orgId) {
        throw new UnauthorizedException('Invalid token payload (missing sub or orgId)');
    }

    return {
        sub,
        email: u.email,
        role:  u.role,
        orgId,
    };
});