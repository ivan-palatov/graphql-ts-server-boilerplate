import { Redis } from 'ioredis';
import { Request } from 'express';
import { GraphQLResolveInfo } from 'graphql';

interface IContext {
  redis: Redis;
  url: string;
  req: Request;
}

export type Resolver = (parent: any, args: any, context: IContext, info: GraphQLResolveInfo) => any;

export type Middleware = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: IContext,
  info: GraphQLResolveInfo
) => any;

export interface IResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
