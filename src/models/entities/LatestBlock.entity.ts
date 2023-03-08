import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Prop } from '@shared/swagger';
import { BaseEntity } from '@shared/api/models/base.entity';

export type LatestBlockDocument = LatestBlock & Document;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
    virtuals: true,
})
export class LatestBlock extends BaseEntity {
    @Prop({ required: true, type: String })
    key: string;

    @Prop({ required: false, type: Number })
    block: number;
}

export const LatestBlockSchema = SchemaFactory.createForClass(LatestBlock);
