import { Injectable } from '@nestjs/common';
import { Web3Service } from '@shared/web3/web3.service';
import { ConfigService } from '@nestjs/config';
import { EEnvKey } from '@constants/env.constant';
import Web3 from 'web3';
import PancakeSwapV2Abi from '@constants/abis/pancake-swap-v2.json';
import { AbiItem } from 'web3-utils';
import { PancakeSwapV2 } from '@constants/contracts';

@Injectable()
export class ContractService {
    private web3: Web3;
    private contract;

    constructor(private web3Service: Web3Service, private configService: ConfigService) {
        this.initContractAndWeb3();
    }

    initContractAndWeb3 = () => {
        this.web3 = this.web3Service.getWeb3();
        this.contract = new this.web3.eth.Contract(
            PancakeSwapV2Abi as AbiItem[],
            this.configService.get<string>(EEnvKey.CONTRACT_ADDRESS),
        ) as unknown as PancakeSwapV2;
    };

    getContract = () => {
        return this.contract;
    };

    reInitContractAndWeb3WithOtherRpc = async () => {
        await this.web3Service.reInitWeb3WithOtherRpc();
        await this.initContractAndWeb3();
    };
}
