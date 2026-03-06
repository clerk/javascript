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

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(app, port, () => console.log(`Server is listening on port ${port}...`));
