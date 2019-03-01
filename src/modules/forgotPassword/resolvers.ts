import { IResolverMap } from '../../types/graphql-utils';

export const resolvers: IResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments
    ) => {
      // send email here
    },
    forgotPasswordChange: async (
      _,
      { password, key }: GQL.IForgotPasswordChangeOnMutationArguments
    ) => {
      // change password here
    },
    forgotPasswordLockAccount: async (
      _,
      { key }: GQL.IForgotPasswordLockAccountOnMutationArguments,
      { redis }
    ) => {
      // check if key is real if not - return false
      // call forgotPasswordLockAccount function, return true
    },
  },
};
