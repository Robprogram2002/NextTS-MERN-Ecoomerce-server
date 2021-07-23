import ExpressRedis from 'express-redis-cache';
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const redisClient = redis.createClient({
  port: +REDIS_PORT,
  host: 'localhost',
});

const cache = ExpressRedis({
  client: redisClient,
  prefix: process.env.REDIS_PREFIX,
});

cache.on('error', (err) => {
  console.log(err);
});

export default cache;
