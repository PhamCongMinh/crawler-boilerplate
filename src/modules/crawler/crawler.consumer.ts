import { Process, Processor } from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import { IQueuePayload } from '@modules/crawler/interfaces';
import { EventLog } from 'web3-core';
import LatestBlockRepository from '@models/repositories/LatestBlock.repository';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { Web3Service } from '@shared/web3/web3.service';
import { ConfigService } from '@nestjs/config';
import { ContractService } from '@modules/crawler/contract.service';
import { CrawlerService } from '@modules/crawler/crawler.service';
import { EEnvKey } from '@constants/env.constant';
import { PancakeSwapV2 } from '@constants/contracts';

@Processor('crawler')
export class CrawlerConsumer {
    private pancakeContract: PancakeSwapV2;
    private readonly sleepInMs;
    constructor(
        private readonly latestBlockRepository: LatestBlockRepository,
        private readonly loggerService: LoggerService,
        private readonly web3Service: Web3Service,
        private readonly configService: ConfigService,
        private contractService: ContractService,
        private crawlerService: CrawlerService,
    ) {
        this.pancakeContract = this.contractService.getContract();
        this.sleepInMs = this.configService.get(EEnvKey.SLEEP_TIME)
            ? Number(this.configService.get(EEnvKey.SLEEP_TIME))
            : Number(1000);
    }

    logger = this.loggerService.getLogger('CrawlerConsumer');

    handleWhenRpcIsError = async () => {
        await this.contractService.reInitContractAndWeb3WithOtherRpc();
        this.pancakeContract = this.contractService.getContract();
    };

    @Process()
    async consumer(job: Job, done: DoneCallback) {
        const payload: IQueuePayload = job.data;
        this.logger.info(`Crawl Pairs from block ${payload.fromBlock} to block ${payload.toBlock}`);
        let pastEvents: EventLog[];

        try {
            pastEvents = await this.pancakeContract.getPastEvents('allEvents', {
                fromBlock: payload.fromBlock,
                toBlock: payload.toBlock,
            });
            if (pastEvents.length === 0) done();
        } catch (e) {
            this.logger.error(`[handleJobConsumer]`, e);
            done(e);
            // change other rpc
            await this.handleWhenRpcIsError();
        }

        try {
            await this.crawlerService.handleEvent(pastEvents);
            done();
        } catch (e) {
            this.logger.error(`[handleJobConsumer]`, e);
            done(e);
        }
    }
}
