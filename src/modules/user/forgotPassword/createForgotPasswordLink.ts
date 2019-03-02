import { v4 as uuid } from 'uuid';
import { Redis } from 'ioredis';

import { FORGOT_PASSWORD_PREFIX } from '../../../utils/constants';

export const createForgotPasswordLink = async (url: string, userId: number, redis: Redis) => {
  const id = uuid();
  await redis.set(`${FORGOT_PASSWORD_PREFIX}${id}`, userId, 'ex', 60 * 20);
  return `${url}/change-password/${id}`;
};
