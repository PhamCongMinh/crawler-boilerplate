import { Module } from '@nestjs/common';

import { CrawlerConsole } from '@modules/crawler/crawler.console';
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

@Module({
    imports: [
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
        CrawlerConsole,
        CrawlerService,
        LatestBlockRepository,
        DexRepository,
        ChainRepository,
        Helper,
        ContractService,
        PairRepository,
    ],
    exports: [],
})
export class CrawlerModule {}
