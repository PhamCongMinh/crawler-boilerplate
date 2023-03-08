import { EEnvKey } from '@constants/env.constant';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { LoggerService } from '@shared/modules/loggers/logger.service';

@Injectable()
export class Web3Service {
    private web3: Web3;
    private rpcIndex = 0;

    constructor(private readonly configService: ConfigService, private readonly loggerService: LoggerService) {
        this.initWeb3(configService);
    }
    private logger = this.loggerService.getLogger('Web3Service');

    initWeb3(configService: ConfigService) {
        // Get RPC link
        const listRpc = configService.get<string>(EEnvKey.LIST_RPC);
        const rpc = listRpc.split(',')[this.rpcIndex % listRpc.split(',').length];
        this.logger.info(`Using RPC : ${rpc}`);

        this.rpcIndex++;
        this.web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    }

    getWeb3(): Web3 {
        return this.web3;
    }

    reInitWeb3WithOtherRpc = () => {
        this.initWeb3(this.configService);
    };
}
