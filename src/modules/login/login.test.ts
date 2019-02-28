import request from 'graphql-request';
// import { User } from '../../entity/User';
// import { createTypeOrmConnection } from '../../utils/createConnection';

const { TEST_HOST } = process.env;
const email = 'test@test.com';
const password = '123testPass';

const registerMutation = (e: string = email, p: string = password) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const loginMutation = (e: string = email, p: string = password) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

beforeAll(async () => {
  // await createTypeOrmConnection();
  await request(TEST_HOST!, registerMutation());
});

describe('Login resolver', () => {
  it('should return error if email not found', async () => {
    expect.assertions(1);
    const res: any = await request(TEST_HOST!, loginMutation('wrong@email.com'));
    expect(res).toEqual({
      login: [{ path: 'global', message: 'invalid credentials' }],
    });
  });
  it('should return error if password is wrong', async () => {
    expect.assertions(1);
    const res: any = await request(TEST_HOST!, loginMutation(email, 'wrongPassword'));
    expect(res).toEqual({
      login: [{ path: 'global', message: 'invalid credentials' }],
    });
  });
  it('should return error if email is not confirmed', async () => {
    expect.assertions(1);
    const res: any = await request(TEST_HOST!, loginMutation(email, password));
    expect(res).toEqual({
      login: [{ path: 'email', message: 'confirm your email address first' }],
    });
  });
  // it('should return null if everything worked fine', async () => {
  //   expect.assertions(1);
  //   await User.update({ email }, { confirmed: true });
  //   const res: any = await request(TEST_HOST!, loginMutation());
  //   expect(res.login).toBeNull();
  // });
});
