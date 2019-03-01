import { Redis } from 'ioredis';

import { removeAllUserSessions } from './removeUserSessions';
import { User } from '../entity/User';

export const forgotPasswordLockAccount = async (userId: number, redis: Redis) => {
  // Cant login functionality
  await User.update({ id: userId }, { forgotPasswordLocked: true });
  // Remove all sessions
  await removeAllUserSessions(userId, redis);
};
