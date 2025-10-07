import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
export class ContactsController {
    constructor(private svc: ContactsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    list(@CurrentUser() user: ReqUser) {
        return this.svc.findAll(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateContactDto, @CurrentUser() user: ReqUser) {
        return this.svc.create(dto, user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@CurrentUser() user: ReqUser, @Param('id') id: string, @Body() dto: UpdateContactDto) {
        return this.svc.update(id, dto, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@CurrentUser() user: ReqUser, @Param('id') id: string) {
        return this.svc.remove(id, user);
    }
}