import { Module } from '@nestjs/common';

import { SeederConsole } from '@modules/seeder/seeder.console';
import DexRepository from '@models/repositories/Dex.repository';
import ChainRepository from '@models/repositories/Chain.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Chain, ChainSchema } from '@models/entities/Chain.entity';
import { Dex, DexSchema } from '@models/entities/Dex.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Chain.name,
                schema: ChainSchema,
            },
            {
                name: Dex.name,
                schema: DexSchema,
            },
        ]),
    ],
    controllers: [],
    providers: [SeederConsole, DexRepository, ChainRepository],
    exports: [],
})
export class SeederModule {}
