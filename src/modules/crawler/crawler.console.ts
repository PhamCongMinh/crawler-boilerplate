import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { CrawlerService } from '@modules/crawler/crawler.service';
import LatestBlockRepository from '@models/repositories/LatestBlock.repository';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { Web3Service } from '@shared/web3/web3.service';
import { ConfigService } from '@nestjs/config';
import { EEnvKey } from '@constants/env.constant';
import { BullLib } from '@modules/crawler/bull.lib';
import Queue, { Job, DoneCallback } from 'bull';
import { CRAWL_PAIR_QUEUE } from '@constants/queue-name.constant';
import { getConfigRedisQueue } from '@config/redis.config';
import Bluebird from 'bluebird';
import { IQueuePayload, IWeb3Event } from '@modules/crawler/interfaces';
import { EventLog } from 'web3-core';
import { EventData } from 'web3-eth-contract';
import { Helper } from '@modules/crawler/helper';

@Console()
@Injectable()
export class CrawlerConsole {
    private crawlPairQueue: Queue.Queue;
    private readonly sleepInMs;
    constructor(
        private readonly latestBlockRepository: LatestBlockRepository,
        private readonly loggerService: LoggerService,
        private readonly web3Service: Web3Service,
        private readonly configService: ConfigService,
        private crawlerService: CrawlerService,
        private readonly helper: Helper,
    ) {
        this.sleepInMs = this.configService.get(EEnvKey.SLEEP_TIME)
            ? Number(this.configService.get(EEnvKey.SLEEP_TIME))
            : Number(1000);
    }

    logger = this.loggerService.getLogger('CrawlerConsole');

    createCrawlQueue = async () => {
        this.crawlPairQueue = await BullLib.createNewQueue(CRAWL_PAIR_QUEUE, getConfigRedisQueue(this.configService));
    };

    @Command({
        command: 'provider-crawler-pair',
        description: 'Run provider crawler pair',
    })
    async provider() {
        this.logger.info('Start provide jobs for CRAWL_PAIR_QUEUE');
        await this.createCrawlQueue();

        // Check Table Latest Block is exist
        let latestBlock;
        latestBlock = await this.latestBlockRepository.getLatestBlockByKey('provider_crawl_pair');
        if (!latestBlock) {
            latestBlock = await this.latestBlockRepository.latestDocumentModel.create({
                key: 'provider_crawl_pair',
                block: Number(this.configService.get<number>(EEnvKey.CONTRACT_FIRST_BLOCK)) - 1,
            });
        }

        let crawledLatestBlock: number = latestBlock.block;
        const sleepTime: number = this.sleepInMs;
        const blockPerProcess: number = this.configService.get(EEnvKey.BLOCK_PER_PROCESS);
        const web3 = this.web3Service.getWeb3();

        while (1) {
            const currentBlock = await web3.eth.getBlockNumber();

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
        const pastEvents: IWeb3Event[] = await this.helper.getPastEvents(this.web3Service.getContract(), payload);
        if (pastEvents.length === 0) done();

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
        await this.createCrawlQueue();
        await this.crawlPairQueue.process(this.handleJobConsumer.bind(this));
    }
}
