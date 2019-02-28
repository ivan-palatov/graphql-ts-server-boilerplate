import { Resolver, Middleware } from '../types/graphql-utils';

export const createMiddleware = (middlewareFn: Middleware, resolverFn: Resolver) => (
  parent: any,
  args: any,
  context: any,
  info: any
) => middlewareFn(resolverFn, parent, args, context, info);
