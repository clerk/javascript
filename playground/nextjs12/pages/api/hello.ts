// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

type Data = {
  name: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const auth = getAuth(req);
  console.log('/api/hello ', auth.userId, req.query);
  res.status(200).json({ name: 'John Doe' });
}
