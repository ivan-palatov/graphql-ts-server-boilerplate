import * as bcrypt from 'bcryptjs';

import { IResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { USER_SESSION_ID_PREFIX } from '../../utils/constants';

export const resolvers: IResolverMap = {
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments, { req, redis }) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return [
            {
              path: 'global',
              message: 'invalid credentials',
            },
          ];
        }
        if (!(await bcrypt.compare(password, user.password))) {
          return [
            {
              path: 'global',
              message: 'invalid credentials',
            },
          ];
        }
        if (!user.confirmed) {
          return [
            {
              path: 'email',
              message: 'confirm your email address first',
            },
          ];
        }
        if (user.forgotPasswordLocked) {
          return [
            {
              path: 'email',
              message:
                "your account is locked, because forgot password was performed, but password wasn't changed",
            },
          ];
        }
        // save cookie
        req.session!.userId = user.id;
        if (req.sessionID) {
          await redis.lpush(`${USER_SESSION_ID_PREFIX}${user.id}`, req.sessionID);
        }
        return null;
      } catch {
        return [
          {
            path: 'global',
            message: 'something went wrong while trying to login',
          },
        ];
      }
    },
  },
};
