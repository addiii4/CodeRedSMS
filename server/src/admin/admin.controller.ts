import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { SuperAdminGuard } from './super-admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ── Public: super-admin login (email + password only, no building code) ──
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.admin.login(body?.email, body?.password);
  }

  // ── Everything below requires a valid super-admin JWT ───────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('whoami')
  whoami(@CurrentUser() user: ReqUser) {
    return { email: user.email, role: user.role, orgId: user.orgId };
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('orgs')
  listOrgs() {
    return this.admin.listOrgs();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('orgs/:id')
  orgDetail(@Param('id') id: string) {
    return this.admin.orgDetail(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('users')
  listUsers(@Query('limit') limit?: string) {
    return this.admin.listUsers(limit ? Math.min(500, parseInt(limit, 10)) : 200);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('messages')
  listMessages(@Query('limit') limit?: string) {
    return this.admin.listMessages(limit ? Math.min(500, parseInt(limit, 10)) : 100);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('ledger')
  listLedger(@Query('limit') limit?: string) {
    return this.admin.listLedger(limit ? Math.min(500, parseInt(limit, 10)) : 200);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('orgs/:id/credits')
  adjustCredits(
    @CurrentUser() user: ReqUser,
    @Param('id') id: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.admin.adjustCredits(id, body.amount, body.reason, user.email ?? 'unknown');
  }

  // ── CRUD on orgs and users ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch('orgs/:id')
  updateOrg(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.admin.updateOrg(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete('orgs/:id')
  deleteOrg(@Param('id') id: string) {
    return this.admin.deleteOrg(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: { displayName?: string; email?: string }) {
    return this.admin.updateUser(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete('users/:id')
  deleteUser(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.admin.deleteUser(id, user.email ?? 'unknown');
  }
}
