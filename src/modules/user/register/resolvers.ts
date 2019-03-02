import * as yup from 'yup';

import { createConfirmEmailLink } from './createConfirmEmailLink';
import { sendConfirmEmail } from './sendConfirmEmail';
import { IResolverMap } from '../../../types/graphql-utils';
import { formatYupError } from '../../../utils/formatYupError';
import { User } from '../../../entity/User';

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
      const user = User.create({ email, password });
      await user.save();
      // Dont want to be sending emails while testing
      if (process.env.NODE_ENV === 'test') {
        return null;
      }
      // Sending confirmation email
      const res = await sendConfirmEmail(email, await createConfirmEmailLink(url, user.id, redis));
      if (!res) {
        return [
          {
            path: 'email',
            message: 'email address is unavailable, please try again later',
          },
        ];
      }
      return null;
    },
  },
};
