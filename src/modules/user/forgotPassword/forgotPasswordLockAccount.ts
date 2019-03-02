import { Redis } from 'ioredis';

import { User } from '../../../entity/User';
import { removeAllUserSessions } from '../../../utils/removeUserSessions';

export const forgotPasswordLockAccount = async (userId: number, redis: Redis) => {
  // Cant login functionality
  await User.update({ id: userId }, { forgotPasswordLocked: true });
  // Remove all sessions
  await removeAllUserSessions(userId, redis);
};
