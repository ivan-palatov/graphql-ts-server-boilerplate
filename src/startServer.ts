import 'reflect-metadata';
import 'dotenv/config';

import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';

import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { createTypeOrmConnection } from './utils/createConnection';
import { generateSchema } from './utils/generateSchema';
import { REDIS_SESSION_PREFIX } from './utils/constants';

export const startServer = async () => {
  // Connecting to DB depending on NODE_ENV
  await createTypeOrmConnection();

  // Creating yoga server
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get('host')}`,
      req: request,
    }),
  });
  // Session store using redis
  const RedisStore = connectRedis(session);

  // Apply middleware
  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: REDIS_SESSION_PREFIX,
      }),
      name: 'qid',
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 3600 * 24 * 30, // 30 days
      },
    })
  );

  // CORS settings, array of multiple origins might be passed
  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === 'test' ? '*' : process.env.FRONTEND_HOST!,
  };

  // Express routes here
  server.express.get('/confirm/:id', confirmEmail);

  // Starting the server
  const app = await server.start({ cors, port: process.env.NODE_ENV === 'test' ? 0 : 4000 });
  console.clear();
  console.log(
    `Server is running at http://localhost:${process.env.NODE_ENV === 'test' ? 0 : 4000}`
  );

  return app;
};
