import { IResolverMap } from '../../types/graphql-utils';
import { USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from '../../utils/constants';

export const resolvers: IResolverMap = {
  Mutation: {
    logout: async (_, __, { req, redis }) => {
      const { userId } = req.session!;
      if (!userId) {
        return true;
      }
      const sessionIds = await redis.lrange(`${USER_SESSION_ID_PREFIX}${userId}`, 0, -1);
      for (const sessionId of sessionIds) {
        await redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`);
      }
      return true;
    },
  },
};
