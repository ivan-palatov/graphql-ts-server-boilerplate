import { Redis } from 'ioredis';
import { Request } from 'express';

export type Resolver = (
  parent: any,
  args: any,
  context: {
    redis: Redis;
    url: string;
    req: Request;
  },
  info: any
) => any;

export type Middleware = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: {
    redis: Redis;
    url: string;
    req: Request;
  },
  info: any
) => any;

export interface IResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
