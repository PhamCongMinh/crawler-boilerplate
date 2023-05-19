import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { EventLog, EventLogDocument } from '@models/entities/EventLog.entity';
import { BaseRepository } from '@shared/api/models/base.repository';

@Injectable()
export class EventLogRepository extends BaseRepository<EventLog, EventLogDocument> {
    constructor(
        @InjectModel(EventLog.name)
        public eventLogDocumentModel: mongoose.PaginateModel<EventLog, mongoose.PaginateModel<EventLogDocument>>,
    ) {
        super(eventLogDocumentModel);
    }
}
