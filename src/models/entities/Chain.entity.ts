import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Prop } from '@shared/swagger';
import { BaseEntity } from '@shared/api/models/base.entity';

export type ChainDocument = Chain & Document;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
    virtuals: true,
})
export class Chain extends BaseEntity {
    @Prop({ required: true, type: String })
    name: string;
}

export const ChainSchema = SchemaFactory.createForClass(Chain);
