import type { NextFunction, Response } from 'express';

import { getAuth, requireAuth, UnauthorizedError, ForbiddenError } from '@clerk/express';
import { Router, Request as ExpressRequest } from 'express';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req: ExpressRequest, res: Response) => {
  return res.json({ auth: getAuth(req) });
});

router.get('/admin-only', async (req: ExpressRequest, res: Response, next: NextFunction) => {
  const auth = getAuth(req);

  if (!auth.has({ role: 'admin' })) {
    return next(new ForbiddenError());
  }

  return res.json({ message: 'Hello admin!', auth });
})

router.use((err: Error, _req: ExpressRequest, res: Response, next: NextFunction) => {
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next(err)
})

export const privateRoutes = router;
