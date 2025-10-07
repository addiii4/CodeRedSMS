import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';



@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
    constructor(private svc: TemplatesService) {}

    @Get()
    list(@CurrentUser() user: ReqUser) { return this.svc.list(user); }

    @Post()
    create(@CurrentUser() user: ReqUser, @Body() dto: CreateTemplateDto) {
        return this.svc.create(user, dto);
    }

    @Patch(':id')
    update(@CurrentUser() user: ReqUser, @Param('id') id: string, @Body() dto: UpdateTemplateDto) {
        return this.svc.update(user, id, dto);
    }

    @Delete(':id')
    remove(@CurrentUser() user: ReqUser, @Param('id') id: string) {
        return this.svc.remove(user, id);
    }
}