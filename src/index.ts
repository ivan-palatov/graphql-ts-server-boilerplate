import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';

import { resolvers } from './resolvers';
import { createConnection } from 'typeorm';

const typeDefs = importSchema(path.join(__dirname, 'schema.graphql'));

(async () => {
  await createConnection();
  console.log('Connected to DB.');
  const server = new GraphQLServer({ typeDefs, resolvers });
  await server.start();
  console.clear();
  console.log('Server is running at http://localhost:4000');
})();
