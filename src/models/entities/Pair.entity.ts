import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Prop } from '@shared/swagger';
import { BaseEntity } from '@shared/api/models/base.entity';

export type PairDocument = Pair & Document;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
    virtuals: true,
})
export class Pair extends BaseEntity {
    @Prop({ required: true, type: String })
    symbol: string;

    @Prop({ required: true, type: String })
    address: string;

    @Prop({ required: true, type: String })
    token0Symbol: string;

    @Prop({ required: true, type: String })
    token1Symbol: string;

    @Prop({ required: true, type: String })
    token0Address: string;

    @Prop({ required: true, type: String })
    token1Address: string;

    @Prop({ required: false, type: Number })
    blockNumber: number;

    @Prop({ required: false, type: Number })
    blockTime: number;

    @Prop({ required: true, type: String })
    transactionHash: string;
}

export const PairSchema = SchemaFactory.createForClass(Pair);
