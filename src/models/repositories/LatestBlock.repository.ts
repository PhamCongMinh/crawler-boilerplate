import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LatestBlock, LatestBlockDocument } from '@models/entities/LatestBlock.entity';

@Injectable()
export default class LatestBlockRepository {
    constructor(
        @InjectModel(LatestBlock.name)
        public latestDocumentModel: Model<LatestBlockDocument>,
    ) {}

    async getLatestBlockByKey(latestKey: string) {
        return this.latestDocumentModel.findOne({ key: latestKey }).exec();
    }

    async updateBlockByKey(latestKey: string, block: number) {
        return this.latestDocumentModel.findOneAndUpdate({ key: latestKey }, { block }, { new: true }).exec();
    }
}
