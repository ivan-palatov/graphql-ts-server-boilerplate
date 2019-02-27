import { request } from 'graphql-request';

import { User } from '../../entity/User';
import { createTypeOrmConnection } from '../../utils/createConnection';

const { TEST_HOST } = process.env;

const email = 'test@test.com';
const password = '123testPass';

const mutation = (e: string = email, p: string = password) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

// Needed to have direct DB access
beforeAll(async () => {
  await createTypeOrmConnection();
})

describe('Register user', async () => {
  it('should return array of errors', async () => {
    expect.assertions(3);
    const response: any = await request(TEST_HOST!, mutation('test.com', '123'));
    expect(response.register).toHaveLength(2);
    expect(response.register[0].path).toBe('email');
    expect(response.register[1].path).toBe('password');
  });
  it('should return null and create a user', async () => {
    expect.assertions(1);
    const response = await request(TEST_HOST!, mutation());
    expect(response).toEqual({ register: null });
  });
  it('should return `already taken` error', async () => {
    expect.assertions(2);
    const response: any = await request(TEST_HOST!, mutation());
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toBe('email');
  });
  it('should find a specified user with hashed password', async () => {
    expect.assertions(2);
    const user = await User.find({ where: { email } });
    expect(user).toHaveLength(1);
    expect(user[0].password).not.toBe(password);
  });
});
