import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dex, DexDocument } from '@models/entities/Dex.entity';

@Injectable()
export default class DexRepository {
    constructor(@InjectModel(Dex.name) public dexDocumentModel: Model<DexDocument>) {}

    create(dex: Partial<DexDocument>): Promise<DexDocument> {
        return this.dexDocumentModel.create(dex);
    }

    getDexByFactoryAddress(factoryAddress: string): Promise<DexDocument> {
        return this.dexDocumentModel.findOne({ factoryAddress }).exec();
    }
}
