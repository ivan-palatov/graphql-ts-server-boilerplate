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

describe('Logout tests', () => {
  it('should logout', async () => {
    expect.assertions(1);
    const client = new TestClient(TEST_HOST!);
    await client.login(email, password);
    await client.logout();
    const res = await client.me();
    expect(res.data.me).toBeNull();
  });
  it('should logout from multiple accounts', async () => {
    expect.assertions(2);
    const client1 = new TestClient(TEST_HOST!);
    const client2 = new TestClient(TEST_HOST!);
    await client1.login(email, password);
    await client2.login(email, password);
    expect(await client1.me()).toEqual(await client2.me());
    await client1.logout();
    expect(await client1.me()).toEqual(await client2.me());
  });
});
