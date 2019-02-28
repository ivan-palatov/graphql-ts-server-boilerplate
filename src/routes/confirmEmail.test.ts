import fetch from 'node-fetch';

import { User } from "../entity/User";
import { createTypeOrmConnection } from "../utils/createConnection";
import { createConfirmEmailLink } from "../utils/createConfirmEmailLink";
import { redis } from "../redis";

let ID = 1;
let url = '';

beforeAll(async () => {
  await createTypeOrmConnection();
  const user = await User.create({ email: 'goodmail@mail.com', password: '123asffas' }).save();

  url = await createConfirmEmailLink(process.env.TEST_HOST!, user.id, redis);

  ID = user.id;
});

describe('confirmEmail route', () => {
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
})