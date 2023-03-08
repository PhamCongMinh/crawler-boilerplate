import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Prop } from '@shared/swagger';
import { BaseEntity } from '@shared/api/models/base.entity';

export type DexDocument = Dex & Document;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
    virtuals: true,
})
export class Dex extends BaseEntity {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: String })
    link: string;

    @Prop({ required: true, type: String })
    factoryAddress: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Chain' })
    chainId: string;
}

export const DexSchema = SchemaFactory.createForClass(Dex);
