import fetch from 'node-fetch';
import { Connection } from 'typeorm';
import * as faker from 'faker';

import { User } from "../entity/User";
import { createTypeOrmConnection } from "../utils/createConnection";
import { redis } from "../redis";
import { createConfirmEmailLink } from '../modules/user/register/createConfirmEmailLink';

let ID = 1;
let url = '';

const email = faker.internet.email();
const password = faker.internet.password();

let connection: Connection;
beforeAll(async () => {
  connection = await createTypeOrmConnection();
  const user = await User.create({ email, password }).save();
  url = await createConfirmEmailLink(process.env.TEST_HOST!, user.id, redis);
  ID = user.id;
  await fetch(url);
});

afterAll(async () => {
  await connection.close();
});

describe('confirmEmail route', () => {
  it('user should be activated', async () => {
    expect.assertions(1);
    const user = await User.findOne(ID);
    expect((user as User).confirmed).toBeTruthy();
  });
  it('should remove id from redis', async () => {
    expect.assertions(1);
    const chunks = url.split('/');
    const uuid = chunks[chunks.length - 1];
    const res = await redis.get(uuid);
    expect(res).toBeFalsy();
  });
  it('should return Indalid code if code is invalid/was used', async () => {
    expect.assertions(2);
    const res = await fetch(url);
    const text = await res.text();
    expect(res.status).toBe(400);
    expect(text).toEqual('Invalid code');
  });
})