import { startServer } from "../startServer";

export default async () => {
  const app = await startServer();
  const address = app.address();
  let port: number = 0;
  if (address && typeof address !== 'string') {
    port = address.port;
  }
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;
};