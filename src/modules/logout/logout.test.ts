import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createConnection';
import { User } from '../../entity/User';
import { TestClient } from '../../utils/TestClient';

const { TEST_HOST } = process.env;

const email = 'test@test.com';
const password = '123testPass';

let connection: Connection;
beforeAll(async () => {
  connection = await createTypeOrmConnection();
  await User.create({ email, password, confirmed: true }).save();
});

afterAll(async () => {
  await connection.close();
});

describe('Logout mutation', () => {
  it('should not return user after logout', async () => {
    expect.assertions(1);
    const client = new TestClient(TEST_HOST!);
    await client.login(email, password);
    await client.logout();
    const res = await client.me();
    expect(res.data.me).toBeNull();
  });
});
