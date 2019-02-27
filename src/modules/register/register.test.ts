import { request } from 'graphql-request';

import { startServer } from '../../startServer';
import { User } from '../../entity/User';


let getHost = () => '';

beforeAll(async () => {
  const app = await startServer();
  const address = app.address();
  let port: number;
  if (address && typeof address !== 'string') {
    port = address.port;
  }
  getHost = () => `http://127.0.0.1:${port}`;
});

const email = 'tester@test.com';
const password = 'test123';

const mutation = `
mutation {
  register(email: "${email}", password: "${password}")
}
`;

describe('Creates new user', async () => {
  it('should return true', async () => {
    expect.assertions(1);
    const response = await request(getHost(), mutation);
    expect(response).toEqual({ register: true });
  });
  it('should find a specified user with hashed password', async () => {
    expect.assertions(2);
    const user = await User.find({ where: { email } });
    expect(user).toHaveLength(1);
    expect(user[0].password).not.toBe(password);
  });
});
