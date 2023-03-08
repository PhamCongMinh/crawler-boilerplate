import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Prop } from '@shared/swagger';

type Test = {
    paginate: any;
};
export type TemplateDocument = Template & Document & Test;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
    virtuals: true,
})
export class Template {
    @Prop({ default: '' })
    content: string;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
