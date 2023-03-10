import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { CrawlerService } from '@modules/crawler/crawler.service';
import LatestBlockRepository from '@models/repositories/LatestBlock.repository';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { Web3Service } from '@shared/web3/web3.service';
import { PancakeSwapV2 } from '@constants/contracts';
import { ConfigService } from '@nestjs/config';
import { EEnvKey } from '@constants/env.constant';
import { ContractService } from '@modules/crawler/contract.service';
import { BullLib } from '@modules/crawler/bull.lib';
import Queue, { Job, DoneCallback } from 'bull';
import { CRAWL_PAIR_QUEUE } from '@constants/queue-name.constant';
import { getConfigRedisQueue } from '@config/redis.config';
import Bluebird from 'bluebird';
import { IQueuePayload } from '@modules/crawler/interfaces';
import { EventLog } from 'web3-core';

@Console()
@Injectable()
export class CrawlerConsole {
    private pancakeContract: PancakeSwapV2;
    private crawlPairQueue: Queue.Queue;
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

    logger = this.loggerService.getLogger('CrawlerConsole');

    handleWhenRpcIsError = async () => {
        await this.contractService.reInitContractAndWeb3WithOtherRpc();
        this.pancakeContract = this.contractService.getContract();
    };

    createCrawlPairQueue = async () => {
        this.crawlPairQueue = await BullLib.createNewQueue(CRAWL_PAIR_QUEUE, getConfigRedisQueue(this.configService));
    };

    @Command({
        command: 'provider-crawler-pair',
        description: 'Run provider crawler pair',
    })
    async provider() {
        this.logger.info('Start provide jobs for CRAWL_PAIR_QUEUE');
        await this.createCrawlPairQueue();

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

            await this.crawlPairQueue.add(payload, {
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

    handleJobConsumer = async (job: Job, done: DoneCallback) => {
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
    };

    @Command({
        command: 'consumer-crawler-pair',
        description: 'Run consumer crawler pair',
    })
    async consumer() {
        await this.createCrawlPairQueue();
        await this.crawlPairQueue.process(this.handleJobConsumer.bind(this));
    }
}
