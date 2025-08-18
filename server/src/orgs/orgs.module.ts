import { Module } from '@nestjs/common';
import { OrgsService } from './orgs.service';

@Module({
    providers: [OrgsService],
    exports: [OrgsService]
})
export class OrgsModule {}