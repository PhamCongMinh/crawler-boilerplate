import { EEnvKey } from '@constants/env.constant';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { Thinkin } from '@constants/contracts';
import { AbiItem } from 'web3-utils';
import THINKIN_ABI from '@constants/abis/thinkin.json';

@Injectable()
export class Web3Service {
    private web3: Web3;
    private contract;

    constructor(private readonly configService: ConfigService, private readonly loggerService: LoggerService) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.configService.get<string>(EEnvKey.RPC)));
        this.contract = new this.web3.eth.Contract(
            THINKIN_ABI as AbiItem[],
            this.configService.get<string>(EEnvKey.CONTRACT_ADDRESS),
        );
    }
    private logger = this.loggerService.getLogger('Web3Service');

    getContract(): Thinkin {
        return this.contract;
    }

    getWeb3(): Web3 {
        return this.web3;
    }
}
