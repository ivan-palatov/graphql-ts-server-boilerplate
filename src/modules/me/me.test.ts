import axios from 'axios';
import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createConnection';
import { User } from '../../entity/User';

const { TEST_HOST } = process.env;

const email = 'test@test.com';
const password = '123testPass';

let userId: number;

let connection: Connection;
beforeAll(async () => {
  connection = await createTypeOrmConnection();
  const user = await User.create({ email, password, confirmed: true }).save();
  userId = user.id;
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

const meQuery = `
{
  me {
    id
    email
  }
}
`;

describe('Me query', () => {
  it('should return null if user not logged in', async () => {
    expect.assertions(1);
    const res = await axios.post(TEST_HOST!, { query: meQuery }, { withCredentials: false });
    expect(res.data.data.me).toBeNull();
  });
  it('should show current user', async () => {
    expect.assertions(1);
    await axios.post(TEST_HOST!, { query: loginMutation() }, { withCredentials: true });
    const res = await axios.post(TEST_HOST!, { query: meQuery }, { withCredentials: true });
    expect(res.data.data).toEqual({
      me: {
        id: `${userId}`,
        email,
      },
    });
  });
});
