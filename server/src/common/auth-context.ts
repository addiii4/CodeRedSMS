import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const jwt = new JwtService({
    secret: process.env.JWT_SECRET || 'dev-secret',
    signOptions: { expiresIn: process.env.JWT_EXPIRES || '15m' },
});

export type JwtPayload = { sub: string; orgId: string; role: string };

export function getAuthContext(req: any): { userId: string; orgId: string; role: string } {
    const auth = req?.headers?.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) throw new BadRequestException('Missing token');
    const payload = jwt.verify(token) as JwtPayload;
    if (!payload?.orgId || !payload?.sub) {
        throw new BadRequestException('Invalid token payload');
    }
    return { userId: payload.sub, orgId: payload.orgId, role: payload.role };
}