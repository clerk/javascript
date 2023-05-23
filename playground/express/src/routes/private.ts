import type { Response } from 'express';

import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { Router } from 'express';

const router = Router();

router.use(ClerkExpressRequireAuth({ clerkClient }));

router.get('/me', async (req, reply: Response) => {
  return reply.json({ auth: req.auth });
});

router.get('/private', async (req, reply: Response) => {
  if (!req.auth.userId) {
    return reply.status(403).end();
  }

  return reply.json({ hello: 'world', auth: req.auth });
});

export const privateRoutes = router;
