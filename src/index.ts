import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_: any, { name }: any) => `Hello ${name || 'User'}`,
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => {
  console.clear();
  console.log('Server is running at http://localhost:4000');
});
