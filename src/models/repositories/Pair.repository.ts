import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pair, PairDocument } from '@models/entities/Pair.entity';

@Injectable()
export class PairRepository {
    constructor(
        @InjectModel(Pair.name)
        public pairDocumentModel: Model<PairDocument>,
    ) {}
}
