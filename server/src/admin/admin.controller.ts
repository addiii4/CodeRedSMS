import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { SuperAdminGuard } from './super-admin.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('whoami')
  whoami(@CurrentUser() user: ReqUser) {
    return { email: user.email, role: user.role, orgId: user.orgId };
  }

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('orgs')
  listOrgs() {
    return this.admin.listOrgs();
  }

  @Get('orgs/:id')
  orgDetail(@Param('id') id: string) {
    return this.admin.orgDetail(id);
  }

  @Get('users')
  listUsers(@Query('limit') limit?: string) {
    return this.admin.listUsers(limit ? Math.min(500, parseInt(limit, 10)) : 200);
  }

  @Get('messages')
  listMessages(@Query('limit') limit?: string) {
    return this.admin.listMessages(limit ? Math.min(500, parseInt(limit, 10)) : 100);
  }

  @Get('ledger')
  listLedger(@Query('limit') limit?: string) {
    return this.admin.listLedger(limit ? Math.min(500, parseInt(limit, 10)) : 200);
  }

  @Post('orgs/:id/credits')
  adjustCredits(
    @CurrentUser() user: ReqUser,
    @Param('id') id: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.admin.adjustCredits(id, body.amount, body.reason, user.email ?? 'unknown');
  }
}
