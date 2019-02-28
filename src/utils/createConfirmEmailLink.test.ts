import fetch from 'node-fetch';

import { redis } from '../redis';
import { createConfirmEmailLink } from './createConfirmEmailLink';
import { createTypeOrmConnection } from './createConnection';
import { User } from '../entity/User';

beforeAll(async () => {
  await createTypeOrmConnection();
});

describe('createConfirmEmailLink function', () => {
  it('link should be valid', async () => {
    expect.assertions(1);
    const user = await User.create({ email: 'goodmail@mail.com', password: '123asffas' }).save();
    const url = await createConfirmEmailLink(process.env.TEST_HOST!, user.id, redis);
    const res = await fetch(url);
    const text = await res.text();
    expect(text).toEqual('Activated!');
  });
});
