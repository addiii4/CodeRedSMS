import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = { sub: string; orgId: string; role: 'admin'|'editor'|'viewer' };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(cfg: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: cfg.getOrThrow<string>('JWT_SECRET')
        });
    }
    async validate(payload: JwtPayload) {
        // this return value becomes req.user
        return { userId: payload.sub, orgId: payload.orgId, role: payload.role };
    }
}