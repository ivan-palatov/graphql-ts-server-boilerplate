import { GraphQLServer } from 'graphql-yoga';

import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { createTypeOrmConnection } from './utils/createConnection';
import { generateSchema } from './utils/generateSchema';

export const startServer = async () => {
  // Connecting to DB depending on NODE_ENV
  await createTypeOrmConnection();

  // Creating yoga server
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({ redis, url: `${request.protocol}://${request.get('host')}` }),
  });

  // Express routes here
  server.express.get('/confirm/:id', confirmEmail);

  // Starting the server
  const app = await server.start({ port: process.env.NODE_ENV === 'test' ? 0 : 4000 });
  console.clear();
  console.log(
    `Server is running at http://localhost:${process.env.NODE_ENV === 'test' ? 0 : 4000}`
  );

  return app;
};
