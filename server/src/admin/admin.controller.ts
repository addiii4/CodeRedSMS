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
  @Get('events')
  events() {
    return this.admin.events();
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

  // ── Org templates ───────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('orgs/:id/templates')
  listOrgTemplates(@Param('id') id: string) {
    return this.admin.listTemplates(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('orgs/:id/templates')
  createOrgTemplate(@Param('id') id: string, @Body() body: { title: string; body: string }) {
    return this.admin.createTemplate(id, body.title, body.body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() body: { title?: string; body?: string }) {
    return this.admin.updateTemplate(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.admin.deleteTemplate(id);
  }

  // ── Org contacts ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('orgs/:id/contacts')
  listOrgContacts(@Param('id') id: string) {
    return this.admin.listContacts(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('orgs/:id/contacts')
  createOrgContact(@Param('id') id: string, @Body() body: { fullName: string; phoneE164: string }) {
    return this.admin.createContact(id, body.fullName, body.phoneE164);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch('contacts/:id')
  updateContact(@Param('id') id: string, @Body() body: { fullName?: string; phoneE164?: string }) {
    return this.admin.updateContact(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete('contacts/:id')
  deleteContact(@Param('id') id: string) {
    return this.admin.deleteContact(id);
  }

  // ── Org approval ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('pending-orgs')
  listPendingOrgs() {
    return this.admin.listPendingOrgs();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('orgs/:id/approve')
  approveOrg(@Param('id') id: string) {
    return this.admin.approveOrg(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('orgs/:id/reject')
  rejectOrg(@Param('id') id: string) {
    return this.admin.rejectOrg(id);
  }
}
