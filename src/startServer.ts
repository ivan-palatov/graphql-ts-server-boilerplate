import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import * as path from 'path';
import * as fs from 'fs';
import * as Redis from 'ioredis';

import { createTypeOrmConnection } from './utils/createConnection';
import { GraphQLSchema } from 'graphql';
import { User } from './entity/User';

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
  // Creating redis instance
  const redis = new Redis();
  // Creating yoga server
  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({ redis, url: `${request.protocol}://${request.get('host')}` }),
  });

  // Confirm email route
  server.express.get('/confirm/:id', async (req, res) => {
    const id: string = req.params.id;
    const userId = await redis.get(id);
    if (!userId) {
      return res.status(400).send('Invalid code');
    }
    await User.update({ id: parseInt(userId, 10) }, { confirmed: true });
    await redis.del(id);
    res.send('Activated!');
  });

  // Starting the server
  const app = await server.start({ port: process.env.NODE_ENV === 'test' ? 0 : 4000 });
  console.clear();
  console.log(
    `Server is running at http://localhost:${process.env.NODE_ENV === 'test' ? 0 : 4000}`
  );

  return app;
};
