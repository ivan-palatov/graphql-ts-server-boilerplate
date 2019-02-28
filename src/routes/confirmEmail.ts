import { Request, Response } from 'express';

import { redis } from '../redis';
import { User } from '../entity/User';

export const confirmEmail = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const userId = await redis.get(id);
  if (!userId) {
    return res.status(400).send('Invalid code');
  }
  await User.update({ id: parseInt(userId, 10) }, { confirmed: true });
  await redis.del(id);
  res.send('Activated!');
};
