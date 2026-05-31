import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ReqUser } from './current-user.decorator';

type JwtPayload = { sub: string; orgId: string; email?: string; role: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET || 'dev-secret',
        });
    }

    async validate(payload: JwtPayload): Promise<ReqUser> {
        return {
            userId: payload.sub,
            sub: payload.sub,
            orgId: payload.orgId,
            email: payload.email,
            role: payload.role,
        };
    }
}