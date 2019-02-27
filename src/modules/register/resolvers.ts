import * as bcrypt from 'bcryptjs';

import { IResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';

export const resolvers: IResolverMap = {
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (await User.findOne({ where: { email } })) {
        return false;
      }
      const user = User.create({ email, password: hashedPassword });
      await user.save();
      return true;
    },
  },
};
