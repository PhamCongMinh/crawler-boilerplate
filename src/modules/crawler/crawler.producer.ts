import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EEnvKey } from '@constants/env.constant';
import Bluebird from 'bluebird';
import { IQueuePayload } from '@modules/crawler/interfaces';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import LatestBlockRepository from '@models/repositories/LatestBlock.repository';
import { Web3Service } from '@shared/web3/web3.service';
import { ConfigService } from '@nestjs/config';
import { ContractService } from '@modules/crawler/contract.service';
import { CrawlerService } from '@modules/crawler/crawler.service';
import { PancakeSwapV2 } from '@constants/contracts';
import { Command, Console } from 'nestjs-console';

@Console()
@Injectable()
export class CrawlerProducer {
    private pancakeContract: PancakeSwapV2;
    private readonly sleepInMs;
    constructor(
        @InjectQueue('crawler') private crawlerQueue: Queue,
        private readonly latestBlockRepository: LatestBlockRepository,
        private readonly loggerService: LoggerService,
        private readonly web3Service: Web3Service,
        private readonly configService: ConfigService,
        private contractService: ContractService,
    ) {
        this.pancakeContract = this.contractService.getContract();
        this.sleepInMs = this.configService.get(EEnvKey.SLEEP_TIME)
            ? Number(this.configService.get(EEnvKey.SLEEP_TIME))
            : Number(1000);
    }
    logger = this.loggerService.getLogger('CrawlerProducer');
    handleWhenRpcIsError = async () => {
        await this.contractService.reInitContractAndWeb3WithOtherRpc();
        this.pancakeContract = this.contractService.getContract();
    };

    @Command({
        command: 'start-crawler-pair',
        description: 'Run provider crawler pair',
    })
    async producer() {
        this.logger.info('Start provide jobs for CRAWL_PAIR_QUEUE');

        // Check Table Latest Block is exist
        let latestBlock;
        latestBlock = await this.latestBlockRepository.getLatestBlockByKey('provider_crawl_pair');
        if (!latestBlock) {
            latestBlock = await this.latestBlockRepository.latestDocumentModel.create({
                key: 'provider_crawl_pair',
                block: Number(this.configService.get<number>(EEnvKey.CONTRACT_FIRST_BLOCK)),
            });
        }

        let crawledLatestBlock: number = latestBlock.block;
        const sleepTime: number = this.sleepInMs;
        const blockPerProcess: number = this.configService.get(EEnvKey.BLOCK_PER_PROCESS);

        while (1) {
            // Get latest BlockNumber in chain and check rpc is still working
            let currentBlock;
            try {
                currentBlock = await this.web3Service.getWeb3().eth.getBlockNumber();
            } catch (e) {
                this.logger.error(e);
                await this.handleWhenRpcIsError();
                continue;
            }

            if (currentBlock <= crawledLatestBlock) {
                this.logger.info('Waiting new block number for create new job for Queue Create Pair');
                await Bluebird.delay(sleepTime);
                continue;
            }

            const fromBlock: number = crawledLatestBlock + 1;
            const toBlock: number = Math.min(currentBlock, Number(crawledLatestBlock) + Number(blockPerProcess));
            const payload: IQueuePayload = {
                fromBlock,
                toBlock,
            };

            await this.crawlerQueue.add(payload, {
                jobId: `${fromBlock}_${toBlock}`,
                delay: 0,
                attempts: 5,
                backoff: {
                    type: 'fixed',
                    delay: 5000,
                },
                removeOnComplete: { age: 60 * 60 * 24 * 2 },
                removeOnFail: false,
            });
            this.logger.info(`Created new job for Queue Create Pair: {fromBlock: ${fromBlock},toBlock: ${toBlock}} `);

            await this.latestBlockRepository.updateBlockByKey('provider_crawl_pair', toBlock);
            crawledLatestBlock = toBlock;
            await Bluebird.delay(sleepTime);
        }
    }
}
