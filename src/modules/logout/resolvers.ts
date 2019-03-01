import { IResolverMap } from '../../types/graphql-utils';

export const resolvers: IResolverMap = {
  Mutation: {
    logout: (_, __, { req }) => {
      if (!req.session || !req.session.userId) {
        return true;
      }
      return new Promise(resolve =>
        req.session!.destroy(err => {
          if (err) {
            return resolve(false);
          }
          resolve(true);
        })
      );
    },
  },
};
