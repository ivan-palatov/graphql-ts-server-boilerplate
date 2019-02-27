import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import * as path from 'path';
import * as fs from 'fs';

import { createTypeOrmConnection } from './utils/createConnection';
import { GraphQLSchema } from 'graphql';

export const startServer = async () => {
  // Connecting to DB depending on NODE_ENV
  await createTypeOrmConnection();
  // Combining all resolvers and schemas from ./modules together
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, 'modules'));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`));
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });
  // Starting a server
  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });
  const app = await server.start({ port: process.env.NODE_ENV === 'test' ? 0 : 4000 });
  console.clear();
  console.log('Server is running at http://localhost:4000');

  return app;
};
