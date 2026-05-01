import { Module } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';

@Module({
    controllers: [OrgsController],
    providers: [OrgsService],
    exports: [OrgsService]
})
export class OrgsModule {}