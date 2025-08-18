import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, ReqUser } from '../auth/current-user.decorator';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
    constructor(private svc: ContactsService) {}

    @Get()
    list(@CurrentUser() user: ReqUser) {
        return this.svc.list(user);
    }

    @Post()
    create(@CurrentUser() user: ReqUser, @Body() dto: CreateContactDto) {
        return this.svc.create(user, dto);
    }

    @Patch(':id')
    update(@CurrentUser() user: ReqUser, @Param('id') id: string, @Body() dto: UpdateContactDto) {
        return this.svc.update(user, id, dto);
    }

    @Delete(':id')
    remove(@CurrentUser() user: ReqUser, @Param('id') id: string) {
        return this.svc.remove(user, id);
    }
}