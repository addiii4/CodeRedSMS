import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrgsModule } from './orgs/orgs.module';
import { ContactsModule } from './contacts/contacts.module';
import { GroupsModule } from './groups/groups.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, cache: true }),
        PrismaModule,
        HealthModule,
        AuthModule,
        UsersModule,
        OrgsModule,
        ContactsModule,
        GroupsModule,
        TemplatesModule
    ]
})
export class AppModule {}