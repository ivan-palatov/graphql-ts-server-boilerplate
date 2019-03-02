import { Connection } from 'typeorm';
import * as faker from 'faker';

import { createTestConnection } from '../../../testUtils/createTestConnection';
import { User } from '../../../entity/User';
import { TestClient } from '../../../testUtils/TestClient';

const { TEST_HOST } = process.env;

const email = faker.internet.email();
const password = faker.internet.password();

let userId: number;

let connection: Connection;
beforeAll(async () => {
  connection = await createTestConnection();
  const user = await User.create({ email, password, confirmed: true }).save();
  userId = user.id;
});

afterAll(async () => {
  await connection.close();
});

describe('Me query', () => {
  const client = new TestClient(TEST_HOST!);
  it('should return null if user not logged in', async () => {
    expect.assertions(1);
    const res = await client.me();
    expect(res.data.me).toBeNull();
  });
  it('should show current user', async () => {
    expect.assertions(1);
    await client.login(email, password);
    const res = await client.me();
    expect(res.data).toEqual({
      me: {
        id: `${userId}`,
        email,
      },
    });
  });
});
