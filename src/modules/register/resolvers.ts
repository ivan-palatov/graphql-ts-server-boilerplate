import * as bcrypt from 'bcryptjs';

import { IResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';

export const resolvers: IResolverMap = {
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      if (await User.findOne({ select: ['id'], where: { email } })) {
        return [
          {
            path: 'email',
            message: 'already taken',
          },
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({ email, password: hashedPassword });
      await user.save();
      return null;
    },
  },
};
