import * as bcrypt from 'bcryptjs';

import { IResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';

export const resolvers: IResolverMap = {
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments, { req }) => {
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
        // save cookie
        req.session!.userId = user.id;
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
