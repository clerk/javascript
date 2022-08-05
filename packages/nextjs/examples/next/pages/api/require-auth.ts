import { requireAuth, RequireAuthProp } from '@clerk/nextjs/api';
import type { NextApiRequest, NextApiResponse } from 'next';

function handler(req: RequireAuthProp<NextApiRequest>, res: NextApiResponse) {
  console.log('Session required');
  res.statusCode = 200;
  res.json(req.auth);
}

export default requireAuth(handler);
