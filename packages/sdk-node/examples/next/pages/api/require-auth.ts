import { requireAuth } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Session required');
  res.statusCode = 200;
  res.json(req.auth);
}

export default requireAuth(handler);
