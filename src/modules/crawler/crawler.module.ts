import { Module } from '@nestjs/common';

import { CrawlerConsole } from '@modules/crawler/crawler.console';
import { MongooseModule } from '@nestjs/mongoose';
import { LatestBlock, LatestBlockSchema } from '@models/entities/LatestBlock.entity';
import LatestBlockRepository from '@models/repositories/LatestBlock.repository';
import { CrawlerService } from '@modules/crawler/crawler.service';
import { Helper } from '@modules/crawler/helper';
import { EventLog, EventLogSchema } from '@models/entities/EventLog.entity';
import { EventLogRepository } from '@models/repositories/EventLog.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: LatestBlock.name,
                schema: LatestBlockSchema,
            },
            {
                name: EventLog.name,
                schema: EventLogSchema,
            },
        ]),
    ],
    controllers: [],
    providers: [CrawlerConsole, CrawlerService, LatestBlockRepository, Helper, EventLogRepository],
    exports: [],
})
export class CrawlerModule {}
