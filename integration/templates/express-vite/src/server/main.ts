import 'dotenv/config';

import { clerkMiddleware, getAuth } from '@clerk/express';
import express from 'express';
import ViteExpress from 'vite-express';

const app = express();

app.use(
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  }),
);

app.get('/api/protected', (req: any, res: any, _next: any) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  res.send('Protected API response');
});

const legacyRequireAuth = (req: any, _res: any, next: any) => {
  if (!req.auth.userId) {
    return next(new Error('Unauthorized'));
  }

  next();
};

app.get('/api/legacy/protected', legacyRequireAuth, (_req: any, res: any, _next: any) => {
  res.send('Protected API response');
});

// Handle authentication error, otherwise application will crash
// @ts-ignore
app.use((err, req, res, next) => {
  if (err) {
    res.status(401).send('Unauthorized');
    return;
  }

  return next();
});

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(app, port, () => console.log(`Server is listening on port ${port}...`));
