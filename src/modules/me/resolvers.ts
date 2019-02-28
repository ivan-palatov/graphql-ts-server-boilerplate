import { IResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { createMiddleware } from '../../utils/createMiddleware';
import { isAuthenticated } from '../../utils/middleware';

export const resolvers: IResolverMap = {
  Query: {
    me: createMiddleware(isAuthenticated, async (_, __, { req }) => {
      return User.findOne(req.session!.userId);
    }),
  },
};
