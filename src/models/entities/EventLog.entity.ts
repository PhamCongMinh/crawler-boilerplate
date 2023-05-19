import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Prop } from '@shared/swagger';
import { BaseEntity } from '@shared/api/models/base.entity';

export type EventLogDocument = EventLog & Document;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
    virtuals: true,
})
export class EventLog extends BaseEntity {
    @Prop({ required: true, type: String })
    address: string;

    @Prop({ required: true, type: String })
    blockHash: string;

    @Prop({ required: true, type: Number })
    blockNumber: number;

    @Prop({ required: true, type: String })
    transactionHash: string;

    @Prop({ required: true, type: String })
    returnValues: string;

    @Prop({ required: false, type: String })
    event: string;

    @Prop({ required: false, type: Number })
    blockTime: number;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);
