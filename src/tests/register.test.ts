import { request } from 'graphql-request';

import { User } from '../entity/User';
import { createTypeOrmConnection } from '../utils/createConnection';

beforeAll(async () => {
  await createTypeOrmConnection();
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
    const response = await request('http://localhost:4000', mutation);
    expect(response).toEqual({ register: true });
  });
  it('should find a specified user with hashed password', async () => {
    expect.assertions(2);
    const user = await User.find({ where: { email } });
    expect(user).toHaveLength(1);
    expect(user[0].password).not.toBe(password);
  });
});
