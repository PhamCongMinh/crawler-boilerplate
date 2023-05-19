import { Injectable } from '@nestjs/common';
import { EventLog } from 'web3-core';
import { Web3Service } from '@shared/web3/web3.service';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { EventLogRepository } from '@models/repositories/EventLog.repository';
import { IWeb3Event } from '@modules/crawler/interfaces';

@Injectable()
export class CrawlerService {
    constructor(
        private eventLogRepository: EventLogRepository,
        private web3Service: Web3Service,
        private readonly loggerService: LoggerService,
    ) {}
    logger = this.loggerService.getLogger('CrawlerService');

    handleEvent = async (events: IWeb3Event[]) => {
        for (let i = 0; i < events.length; i++) {
            await this.eventLogRepository.create({
                address: events[i].address,
                blockHash: events[i].blockHash,
                blockNumber: events[i].blockNumber,
                transactionHash: events[i].transactionHash,
                returnValues: JSON.stringify(events[i].returnValues),
                event: events[i].event,
                blockTime: events[i].blockTime,
            });
        }
    };
}
