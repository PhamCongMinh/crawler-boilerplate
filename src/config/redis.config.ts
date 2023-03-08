import { ConfigService } from '@nestjs/config';
import { EEnvKey } from '@constants/env.constant';
import * as Redis from 'ioredis';

export function getConfigRedisQueue(config: ConfigService): Redis.RedisOptions {
    return {
        host: config.get<string>(EEnvKey.REDIS_HOST),
        port: config.get<number>(EEnvKey.REDIS_PORT),
        password: config.get<string>(EEnvKey.REDIS_PASSWORD),
        db: config.get<number>(EEnvKey.REDIS_DB_NUMBER),
    };
}
