import { withAuth, WithAuthProp } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

function handler(req: WithAuthProp<NextApiRequest>, res: NextApiResponse) {
  console.log('Session optional');
  res.statusCode = 200;
  res.json(req.auth);
}

export default withAuth(handler);
