import { Injectable } from '@nestjs/common';
import { PairRepository } from '@models/repositories/Pair.repository';
import { EventLog } from 'web3-core';
import { Pair } from '@models/entities/Pair.entity';
import { Web3Service } from '@shared/web3/web3.service';
import Erc1155Abi from '../../constants/abis/erc1155.json';
import { AbiItem } from 'web3-utils';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { Erc1155 } from '@constants/contracts';

@Injectable()
export class CrawlerService {
    constructor(
        private pairRepository: PairRepository,
        private web3Service: Web3Service,
        private readonly loggerService: LoggerService,
    ) {}
    logger = this.loggerService.getLogger('CrawlerService');

    handleEvent = async (events: EventLog[]) => {
        for (let i = 0; i < events.length; i++) {
            switch (events[i].event) {
                case 'PairCreated':
                    this.logger.info(`Handle Event Create Pair:`);
                    console.log(events[i]);
                    await this.handleEventCreatePair(events[i]);
                    break;
                default: {
                    break;
                }
            }
        }
    };

    handleEventCreatePair = async (event: EventLog) => {
        this.logger.info(`Start run handleEventCreatePair:`);
    };
}
