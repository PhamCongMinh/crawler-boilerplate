import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chain, ChainDocument } from '@models/entities/Chain.entity';

@Injectable()
export default class ChainRepository {
    constructor(
        @InjectModel(Chain.name)
        public chainDocumentModel: Model<ChainDocument>,
    ) {}

    create(chain: Partial<ChainDocument>): Promise<ChainDocument> {
        return this.chainDocumentModel.create(chain);
    }

    getChainByName(name: string): Promise<ChainDocument> {
        return this.chainDocumentModel
            .findOne({
                name,
            })
            .exec();
    }
}
