// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, debug } = getAuth(req);

  console.log('hello:debug', debug());
  console.log('/api/hello ', userId, req.query);
  res.status(200).json({ userId });
}
