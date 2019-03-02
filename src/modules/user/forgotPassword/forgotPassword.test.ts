import { Connection } from 'typeorm';
import * as faker from 'faker';

import { createForgotPasswordLink } from './createForgotPasswordLink';
import { createTestConnection } from '../../../testUtils/createTestConnection';
import { User } from '../../../entity/User';
import { TestClient } from '../../../testUtils/TestClient';
import { FRONTEND_HOST } from '../../../utils/constants';
import { redis } from '../../../redis';

const { TEST_HOST } = process.env;

const email = faker.internet.email();
const password = faker.internet.password();
const newPassword = faker.internet.password();

let connection: Connection;
let userId: number;
beforeAll(async () => {
  connection = await createTestConnection();
  const user1 = await User.create({ email, password, confirmed: true }).save();
  userId = user1.id;
});

afterAll(async () => {
  await connection.close();
});

describe('Forgot password', () => {
  it('should work', async () => {
    expect.assertions(2);
    const client = new TestClient(TEST_HOST!);
    const url = await createForgotPasswordLink(FRONTEND_HOST, userId, redis);
    const parts = url.split('/');
    const key = parts[parts.length - 1];
    const res = await client.forgotPasswordChange(newPassword, key);
    expect(res.data.forgotPasswordChange).toBeNull();
    const loginRes = await client.login(email, newPassword);
    expect(loginRes.data.login).toBeNull();
  });
  it('should return error if key is incorrect', async () => {
    expect.assertions(1);
    const client = new TestClient(TEST_HOST!);
    const res = await client.forgotPasswordChange(newPassword, 'topKeyEver123');
    expect(res.data.forgotPasswordChange).toEqual([{ path: 'key', message: 'invalid key' }]);
  });
  it('should return error if password is bad', async () => {
    expect.assertions(1);
    const client = new TestClient(TEST_HOST!);
    const url = await createForgotPasswordLink(FRONTEND_HOST, userId, redis);
    const parts = url.split('/');
    const key = parts[parts.length - 1];
    const res = await client.forgotPasswordChange('123', key);
    expect(res.data.forgotPasswordChange[0].path).toBe('password');
  });
  it('should lock account', async () => {
    expect.assertions(1);
    const client = new TestClient(TEST_HOST!);
    const url = await createForgotPasswordLink(FRONTEND_HOST, userId, redis);
    const parts = url.split('/');
    const key = parts[parts.length - 1];
    await client.forgotPasswordLockAccount(key);
    const user = await User.findOne(userId);
    expect(user!.forgotPasswordLocked).toBeTruthy();
  })
});
