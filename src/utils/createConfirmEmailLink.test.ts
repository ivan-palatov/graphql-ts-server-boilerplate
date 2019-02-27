import * as Redis from 'ioredis';
import fetch from 'node-fetch';

import { createConfirmEmailLink } from './createConfirmEmailLink';
import { createTypeOrmConnection } from './createConnection';
import { User } from '../entity/User';

let ID = 1;
let redis: Redis.Redis;
let url = '';

beforeAll(async () => {
  await createTypeOrmConnection();
  const user = await User.create({ email: 'goodmail@mail.com', password: '123asffas' }).save();

  redis = new Redis();
  url = await createConfirmEmailLink(process.env.TEST_HOST!, ID, redis);

  ID = user.id;
});

describe('createConfirmEmailLink function', () => {
  it('link should be valid', async () => {
    expect.assertions(1);
    const res = await fetch(url);
    const text = await res.text();
    expect(text).toEqual('Activated!');
  });
  it('user should be activated', async () => {
    expect.assertions(1);
    const user = await User.findOne(ID);
    expect((user as User).confirmed).toBeTruthy();
  });
  it('id should be removed from redis', async () => {
    expect.assertions(1);
    const chunks = url.split('/');
    const uuid = chunks[chunks.length - 1];
    const res = await redis.get(uuid);
    expect(res).toBeFalsy();
  });
  it('should return Indalid code', async () => {
    expect.assertions(2);
    const res = await fetch(`${url}123`);
    const text = await res.text();
    expect(res.status).toBe(400);
    expect(text).toEqual('Invalid code');
  });
});
