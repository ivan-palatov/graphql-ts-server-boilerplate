import { Middleware } from '../types/graphql-utils';

export const isAuthenticated: Middleware = async (resolver, parent, args, context, info) => {
  const result = await resolver(parent, args, context, info);

  return result;
};
