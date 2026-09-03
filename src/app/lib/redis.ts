import { Redis } from '@upstash/redis';
import config from '../config';

export const redisClient = new Redis({
  url: config.redis_rest_url,
  token: config.redis_rest_token,
});