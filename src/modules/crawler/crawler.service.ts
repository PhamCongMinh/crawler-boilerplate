import { Injectable } from '@nestjs/common';
import { PairRepository } from '@models/repositories/Pair.repository';
import { EventLog } from 'web3-core';
import { Pair } from '@models/entities/Pair.entity';
import { Web3Service } from '@shared/web3/web3.service';
import PairAbi from '../../constants/abis/pair-v2.abi.json';
import TokenAbi from '../../constants/abis/erc20.abi.json';
import { AbiItem } from 'web3-utils';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { Erc20Abi, PairV2Abi } from '@constants/contracts';
import { Prop } from '@shared/swagger';

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
        const { token0Address, token1Address, token0Symbol, token1Symbol } = await this.getPairInformation(
            event.returnValues[2],
        );
        this.logger.info(`Finish getPairInformation: `);

        const pairData: Pair = {
            symbol: `${token0Symbol}/${token1Symbol}`,
            address: event.returnValues[2],
            token0Symbol: token0Symbol,
            token1Symbol: token1Symbol,
            token0Address: token0Address,
            token1Address: token1Address,
            blockNumber: event.blockNumber,
            blockTime: event.blockNumber,
            transactionHash: event.transactionHash,
        };
        this.logger.info(`PairData:`);
        console.log('pairData', pairData);

        await this.pairRepository.pairDocumentModel.create(pairData);
    };

    getPairInformation = async (address: string) => {
        const web3 = this.web3Service.getWeb3();
        const pairContract = new web3.eth.Contract(PairAbi as AbiItem[], address) as unknown as PairV2Abi;

        const token0Address = await pairContract.methods.token0().call();
        const token1Address = await pairContract.methods.token1().call();
        this.logger.info(`getPairInformation: token0Address: ${token0Address}, token1Address: ${token1Address}`);

        const token0Symbol = await this.getTokenInformation(token0Address);
        const token1Symbol = await this.getTokenInformation(token1Address);
        return { token0Address, token1Address, token0Symbol, token1Symbol };
    };

    getTokenInformation = async (address: string) => {
        const web3 = this.web3Service.getWeb3();
        const tokenContract = new web3.eth.Contract(TokenAbi as AbiItem[], address) as unknown as Erc20Abi;
        const tokenSymbol = await tokenContract.methods.name().call();
        this.logger.info(`getTokenInformation: tokenSymbol: ${tokenSymbol}`);
        return tokenSymbol;
    };
}
