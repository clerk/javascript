import { getAuth, requireAuth, UnauthorizedError, ForbiddenError } from '@clerk/express';
import {
  Router,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction
} from 'express';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req: ExpressRequest, res: ExpressResponse) => {
  return res.json({ auth: getAuth(req) });
});

router.get('/admin-only', async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const auth = getAuth(req);

  if (!auth.has({ role: 'admin' })) {
    return next(new ForbiddenError());
  }

  return res.json({ message: 'Hello admin!', auth });
})

router.use((err: Error, _req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next(err)
})

export const privateRoutes = router;
