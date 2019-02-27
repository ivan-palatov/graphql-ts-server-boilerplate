import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';

import { IResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink';

const schema = yup.object().shape({
  email: yup
    .string()
    .email()
    .min(4)
    .max(255),
  password: yup
    .string()
    .min(6)
    .max(75),
});

export const resolvers: IResolverMap = {
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      // Validation
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
      const { email, password } = args;
      if (await User.findOne({ select: ['id'], where: { email } })) {
        return [
          {
            path: 'email',
            message: 'email already taken',
          },
        ];
      }
      // Saving user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({ email, password: hashedPassword });
      await user.save();
      // Confirmation email
      const link = await createConfirmEmailLink(url, user.id, redis);
      console.log(link);
      return null;
    },
  },
};
