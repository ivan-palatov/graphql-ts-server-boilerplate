import * as yup from 'yup';
import * as bcrypt from 'bcryptjs';

import { User } from '../../entity/User';
import { IResolverMap } from '../../types/graphql-utils';
import { FRONTEND_HOST, FORGOT_PASSWORD_PREFIX } from '../../utils/constants';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { sendForgotPasswordEmail } from '../../utils/sendForgotPasswordEmail';
import { formatYupError } from '../../utils/formatYupError';

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6)
    .max(75),
});

export const resolvers: IResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: 'email',
            message: 'User with this email does not exist',
          },
        ];
      }
      const url = await createForgotPasswordLink(FRONTEND_HOST, user.id, redis);
      const res = await sendForgotPasswordEmail(email, url);
      if (!res) {
        return [
          {
            path: 'email',
            message: 'Something went wrong while trying to send you email, please try again later.',
          },
        ];
      }
      return null;
    },
    forgotPasswordChange: async (
      _,
      { password, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const userId = await redis.get(`${FORGOT_PASSWORD_PREFIX}${key}`);
      if (!userId) {
        return [{ path: 'key', message: 'invalid key' }];
      }
      // Validation
      try {
        await schema.validate({ password }, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
      // If everything is okay - proceed to change password
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatePromise = User.update(
          { id: parseInt(userId, 10) },
          { password: hashedPassword, forgotPasswordLocked: false }
        );
        const deleteKeyPromise = redis.del(`${FORGOT_PASSWORD_PREFIX}${key}`);
        await Promise.all([updatePromise, deleteKeyPromise]);
      } catch {
        return [
          {
            path: 'password',
            message: 'something went wrong while trying to save password, please try again',
          },
        ];
      }
      return null;
    },
    forgotPasswordLockAccount: async (
      _,
      { key }: GQL.IForgotPasswordLockAccountOnMutationArguments,
      { redis }
    ) => {
      const userId = await redis.get(`${FORGOT_PASSWORD_PREFIX}${key}`);
      if (!userId) {
        return false;
      }
      await User.update({ id: parseInt(userId, 10) }, { forgotPasswordLocked: true });
      return true;
    },
  },
};
