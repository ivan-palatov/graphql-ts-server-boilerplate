import fetch from 'node-fetch';
import { Connection } from 'typeorm';
import * as faker from 'faker';

import { createConfirmEmailLink } from './createConfirmEmailLink';
import { createTestConnection } from '../../../testUtils/createTestConnection';
import { User } from '../../../entity/User';
import { redis } from '../../../redis';

let connection: Connection;
beforeAll(async () => {
  connection = await createTestConnection();
});

afterAll(async () => {
  await connection.close();
});

describe('createConfirmEmailLink function', () => {
  it('link should be valid', async () => {
    expect.assertions(1);
    const user = await User.create({
      email: faker.internet.email(),
      password: faker.internet.password(),
    }).save();
    const url = await createConfirmEmailLink(process.env.TEST_HOST!, user.id, redis);
    const res = await fetch(url);
    const text = await res.text();
    expect(text).toEqual('Activated!');
  });
});
