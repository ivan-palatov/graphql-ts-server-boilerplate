import { IResolverMap } from "./types/graphql-utils";

export const resolvers: IResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) => `Hello ${name || 'User'}`,
  },
  Mutation: {
    register: (_, { email, password }: GQL.IRegisterOnMutationArguments) => true
  }
};