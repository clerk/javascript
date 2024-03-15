import type { Response } from 'express';

import { getAuth, requireAuth } from '@clerk/express';
import { Router, Request as ExpressRequest } from 'express';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req: ExpressRequest, reply: Response) => {
  return reply.json({ auth: getAuth(req) });
});

router.get('/private', async (req, reply: Response) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    return reply.status(403).end();
  }

  return reply.json({ hello: 'world', auth });
});

export const privateRoutes = router;
