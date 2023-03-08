import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import DexRepository from '@models/repositories/Dex.repository';
import ChainRepository from '@models/repositories/Chain.repository';
import * as dataJson from './../../../seedData.json';

@Console()
@Injectable()
export class SeederConsole {
    constructor(private dexRepository: DexRepository, private chainRepository: ChainRepository) {}

    @Command({
        command: 'seed-data',
        description: 'Seeding pool data',
    })
    async handle(): Promise<void> {
        console.log('Start seed data');
        const data = JSON.parse(JSON.stringify(dataJson));

        console.log('Start seed data for tables: dex, chain');
        for (let i = 0; i < data.chains.length; i++) {
            const { dexes, ...chainData } = data.chains[i];

            const chain = await this.chainRepository.chainDocumentModel.findOneAndUpdate(
                { name: data.chains[i].name },
                chainData,
                { new: true, upsert: true },
            );

            for (let j = 0; j < dexes.length; j++) {
                await this.dexRepository.dexDocumentModel.findOneAndUpdate(
                    { name: dexes[j].name },
                    {
                        ...dexes[j],
                        chainId: chain._id,
                    },
                    { upsert: true },
                );
            }
        }
        console.log('Seeded data successfully');
    }
}
