import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { memoryStorage } from 'multer';
import { ConsoleModule } from 'nestjs-console';

import { ConfigurationModule } from '@config/config.module';
import { DatabaseModule } from '@config/database.module';

import { LoggingModule } from '@shared/modules/loggers/logger.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MODULES } from './modules';
import { Web3Module } from '@shared/web3/web3.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfigRedisQueue } from '@config/redis.config';

@Module({
    imports: [
        ConfigurationModule,
        DatabaseModule,
        LoggingModule,
        ConsoleModule,
        Web3Module,
        MulterModule.register({
            storage: memoryStorage(),
        }),
        ScheduleModule.forRoot(),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                return {
                    redis: {
                        ...getConfigRedisQueue(config),
                    },
                };
            },
        }),
        ...MODULES,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
