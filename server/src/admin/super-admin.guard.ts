import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

/**
 * Allows the request only if the JWT user's email is in SUPER_ADMIN_EMAILS
 * (comma-separated list in .env). Must be paired with JwtAuthGuard so
 * req.user is populated before this guard runs.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const email: string | undefined = req?.user?.email;

    const allowlist = (process.env.SUPER_ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!email || !allowlist.includes(email.toLowerCase())) {
      throw new ForbiddenException('Super-admin access required');
    }
    return true;
  }
}
