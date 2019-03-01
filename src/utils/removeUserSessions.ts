import { Redis } from 'ioredis';

import { USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from './constants';

export const removeAllUserSessions = async (userId: number, redis: Redis) => {
  const sessionIds = await redis.lrange(`${USER_SESSION_ID_PREFIX}${userId}`, 0, -1);
  const promises: Array<Promise<number>> = [];
  for (const sessionId of sessionIds) {
    promises.push(redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`));
  }
  await Promise.all(promises);
};
