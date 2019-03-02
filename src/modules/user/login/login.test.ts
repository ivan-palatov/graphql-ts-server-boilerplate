import { Connection } from 'typeorm';
import * as faker from 'faker';

import { createTestConnection } from '../../../testUtils/createTestConnection';
import { TestClient } from '../../../testUtils/TestClient';
import { User } from '../../../entity/User';

const { TEST_HOST } = process.env;

const email = faker.internet.email();
const password = faker.internet.password();

let connection: Connection;
beforeAll(async () => {
  connection = await createTestConnection();
  const client = new TestClient(TEST_HOST!);
  await client.register(email, password);
});

afterAll(async () => {
  await connection.close();
});

describe('Login resolver', () => {
  const client = new TestClient(TEST_HOST!);
  it('should return error if email not found', async () => {
    expect.assertions(1);
    const res = await client.login('wrong@email.com', password);
    expect(res.data).toEqual({
      login: [{ path: 'global', message: 'invalid credentials' }],
    });
  });
  it('should return error if password is wrong', async () => {
    expect.assertions(1);
    const res = await client.login(email, 'wrongPassword');
    expect(res.data).toEqual({
      login: [{ path: 'global', message: 'invalid credentials' }],
    });
  });
  it('should return error if email is not confirmed', async () => {
    expect.assertions(1);
    const res = await client.login(email, password);
    expect(res.data).toEqual({
      login: [{ path: 'email', message: 'confirm your email address first' }],
    });
  });
  it('should return null if everything worked fine', async () => {
    expect.assertions(1);
    await User.update({ email }, { confirmed: true });
    const res = await client.login(email, password);
    expect(res.data.login).toBeNull();
  });
  it('should return error if account is locked via forgot password', async () => {
    expect.assertions(1);
    await User.update({ email }, { forgotPasswordLocked: true });
    await client.logout();
    const res = await client.login(email, password);
    expect(res.data.login).toEqual([
      {
        path: 'email',
        message:
          "your account is locked, because forgot password was performed, but password wasn't changed",
      },
    ]);
  });
});
