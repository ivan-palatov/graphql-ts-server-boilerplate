import { Connection } from 'typeorm';

import { User } from '../../entity/User';
import { createTypeOrmConnection } from '../../utils/createConnection';
import { TestClient } from '../../utils/TestClient';

const { TEST_HOST } = process.env;

const email = 'test@test.com';
const password = '123testPass';

let connection: Connection;
beforeAll(async () => {
  connection = await createTypeOrmConnection();
});

afterAll(async () => {
  await connection.close();
});

describe('Register user', () => {
  const client = new TestClient(TEST_HOST!);
  it('should return array of errors', async () => {
    expect.assertions(3);
    const response = await client.register('test.com', '123');
    expect(response.data.register).toHaveLength(2);
    expect(response.data.register[0].path).toBe('email');
    expect(response.data.register[1].path).toBe('password');
  });
  it('should return null and create a user', async () => {
    expect.assertions(1);
    const response = await client.register(email, password);
    expect(response.data).toEqual({ register: null });
  });
  it('should return `already taken` error', async () => {
    expect.assertions(2);
    const response = await client.register(email, password);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0].path).toBe('email');
  });
  it('should find a specified user with hashed password', async () => {
    expect.assertions(2);
    const user = await User.find({ where: { email } });
    expect(user).toHaveLength(1);
    expect(user[0].password).not.toBe(password);
  });
});
