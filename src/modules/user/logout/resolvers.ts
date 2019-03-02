import { IResolverMap } from "../../../types/graphql-utils";
import { removeAllUserSessions } from "../../../utils/removeUserSessions";

export const resolvers: IResolverMap = {
  Mutation: {
    logout: async (_, __, { req, redis }) => {
      const { userId } = req.session!;
      if (!userId) {
        return true;
      }
      await removeAllUserSessions(userId, redis);
      return true;
    },
  },
};
