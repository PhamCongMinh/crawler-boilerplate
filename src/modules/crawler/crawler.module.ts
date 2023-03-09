import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { LatestBlock, LatestBlockSchema } from '@models/entities/LatestBlock.entity';
import LatestBlockRepository from '@models/repositories/LatestBlock.repository';
import { CrawlerService } from '@modules/crawler/crawler.service';
import { Dex, DexSchema } from '@models/entities/Dex.entity';
import DexRepository from '@models/repositories/Dex.repository';
import { Chain, ChainSchema } from '@models/entities/Chain.entity';
import ChainRepository from '@models/repositories/Chain.repository';
import { Helper } from '@modules/crawler/helper';
import { ContractService } from '@modules/crawler/contract.service';
import { PairRepository } from '@models/repositories/Pair.repository';
import { Pair, PairSchema } from '@models/entities/Pair.entity';
import { BullModule } from '@nestjs/bull';
import { CrawlerProducer } from '@modules/crawler/crawler.producer';
import { CrawlerConsumer } from '@modules/crawler/crawler.consumer';

@Module({
    imports: [
        BullModule.registerQueueAsync({
            name: 'crawler',
        }),
        MongooseModule.forFeature([
            {
                name: LatestBlock.name,
                schema: LatestBlockSchema,
            },
            {
                name: Dex.name,
                schema: DexSchema,
            },
            {
                name: Chain.name,
                schema: ChainSchema,
            },
            {
                name: Pair.name,
                schema: PairSchema,
            },
        ]),
    ],
    controllers: [],
    providers: [
        CrawlerService,
        LatestBlockRepository,
        DexRepository,
        ChainRepository,
        Helper,
        ContractService,
        PairRepository,
        CrawlerProducer,
        CrawlerConsumer,
    ],
    exports: [],
})
export class CrawlerModule {}
