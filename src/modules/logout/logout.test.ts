import axios from 'axios';
import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createConnection';
import { User } from '../../entity/User';

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

const loginMutation = (e: string = email, p: string = password) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const logoutMutation = `
mutation {
  logout
}
`;

const meQuery = `
{
  me {
    id
    email
  }
}
`;

describe('Logout mutation', () => {
  it('should not return user after logout', async () => {
    expect.assertions(1);
    await axios.post(TEST_HOST!, { query: loginMutation() }, { withCredentials: true });
    await axios.post(TEST_HOST!, { query: logoutMutation }, { withCredentials: true });
    const res = await axios.post(TEST_HOST!, { query: meQuery }, { withCredentials: true });
    expect(res.data.data.me).toBeNull();
  });
});
