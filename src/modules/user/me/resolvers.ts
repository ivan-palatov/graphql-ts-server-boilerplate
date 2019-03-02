import { IResolverMap } from "../../../types/graphql-utils";
import { isAuthenticated } from "../../../utils/isAuthMiddleware";
import { createMiddleware } from "../../../utils/createMiddleware";
import { User } from "../../../entity/User";


export const resolvers: IResolverMap = {
  Query: {
    me: createMiddleware(isAuthenticated, async (_, __, { req }) => {
      return User.findOne(req.session!.userId);
    }),
  },
};
