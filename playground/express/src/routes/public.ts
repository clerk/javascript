import { Router } from 'express';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

const router = Router();

const experimental_isApiRoute = (url: URL) => url.pathname === '/public';
router.use(ClerkExpressWithAuth({ experimental_isApiRoute }));

router.get('/public', async (_req, reply) => {
  return reply.json({ hello: 'world' });
});

router.get('/home', function (_req, res) {
  return res.render('home.ejs', {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    domain: process.env.CLERK_DOMAIN,
    isSatellite: process.env.CLERK_IS_SATELLITE,
    signInUrl: process.env.CLERK_SIGN_IN_URL,
  });
});

export const publicRoutes = router;
