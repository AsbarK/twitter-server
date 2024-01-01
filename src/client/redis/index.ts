import {Redis} from 'ioredis'


export const redisClient = new Redis(process.env.REDIS_CLEINT_URL!)