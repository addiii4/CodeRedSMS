import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
    // ── Security guard ──────────────────────────────────────────────────────
    // Refuse to start in production with the default dev secret.
    // Set a strong random value in your production .env:
    //   JWT_SECRET="$(openssl rand -hex 64)"
    const jwtSecret = process.env.JWT_SECRET ?? '';
    const insecureDefaults = ['dev-secret', 'dev_replace_me', '', 'secret', 'changeme'];
    if (process.env.NODE_ENV === 'production' && insecureDefaults.includes(jwtSecret)) {
        console.error('❌  JWT_SECRET is not set or is using an insecure default value.');
        console.error('   Generate one with: openssl rand -hex 64');
        console.error('   Then set JWT_SECRET in your production .env');
        process.exit(1);
    }
    if (insecureDefaults.includes(jwtSecret)) {
        console.warn('⚠️  WARNING: JWT_SECRET is using an insecure default. Set a strong secret before deploying.');
    }
    // ────────────────────────────────────────────────────────────────────────

    const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, rawBody: true });
    app.enableCors({ origin: '*', credentials: false });

    // Serve the super-admin web dashboard at /admin/ (before the global API prefix).
    // Source: server/public/admin/index.html — resolved from the server's cwd
    // (always `server/` whether started in dev via ts-node or prod from dist).
    app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/' });

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 API running on port ${process.env.PORT ?? 3000}`);
    console.log(`🛡  Super-admin dashboard at /admin/`);
}
bootstrap();
