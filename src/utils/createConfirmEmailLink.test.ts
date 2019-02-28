import fetch from 'node-fetch';
import { Connection } from 'typeorm';

import { redis } from '../redis';
import { createConfirmEmailLink } from './createConfirmEmailLink';
import { createTypeOrmConnection } from './createConnection';
import { User } from '../entity/User';

let connection: Connection;
beforeAll(async () => {
  connection = await createTypeOrmConnection();
});

afterAll(async () => {
  await connection.close();
});

describe('createConfirmEmailLink function', () => {
  it('link should be valid', async () => {
    expect.assertions(1);
    const user = await User.create({
      email: 'goodmailfortst@mail.com',
      password: '123asffas',
    }).save();
    const url = await createConfirmEmailLink(process.env.TEST_HOST!, user.id, redis);
    const res = await fetch(url);
    const text = await res.text();
    expect(text).toEqual('Activated!');
  });
});
