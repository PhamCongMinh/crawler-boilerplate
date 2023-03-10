import { Injectable } from '@nestjs/common';
import { Web3Service } from '@shared/web3/web3.service';
import { CrawlerService } from '@modules/crawler/crawler.service';
import { ConfigService } from '@nestjs/config';
import { EventData } from 'web3-eth-contract';
import pLimit from 'p-limit';
import { LoggerService } from '@shared/modules/loggers/logger.service';

const limit = pLimit(5);

@Injectable()
export class Helper {
    constructor(
        private readonly crawlerService: CrawlerService,
        private configService: ConfigService,
        private web3Service: Web3Service,
        private loggerService: LoggerService,
    ) {}
    private logger = this.loggerService.getLogger('CrawlHelper');

    async getBlockTimeByBlockNumbers(eventLogs: EventData[]) {
        const blockNumbers = Array.from(new Set(eventLogs.map((log: EventData) => log.blockNumber)));
        const blockInfos = await Promise.all(
            blockNumbers.map(async (blockNumber: number) =>
                limit(() => this.web3Service.getWeb3().eth.getBlock(blockNumber)),
            ),
        );
        return blockInfos.reduce((blockTimeByNumber: any, blockInfo: any) => {
            return {
                ...blockTimeByNumber,
                [blockInfo.number]: blockInfo.timestamp,
            };
        }, {});
    }
}
