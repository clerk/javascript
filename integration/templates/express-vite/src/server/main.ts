// Should be at the top of the file - used to load clerk secret key
import * as dotenv from 'dotenv';
dotenv.config();

import { clerkClient } from '@clerk/clerk-sdk-node';
import express from 'express';
import ViteExpress from 'vite-express';

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.get('/api/protected', [clerkClient.expressRequireAuth() as any], (_req: any, res: any) => {
  res.send('Protected API response').end();
});

app.get('/sign-in', (_req: any, res: any) => {
  return res.render('sign-in.ejs', {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    signInUrl: process.env.CLERK_SIGN_IN_URL,
  });
});

app.get('/', (_req: any, res: any) => {
  return res.render('index.ejs', {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    signInUrl: process.env.CLERK_SIGN_IN_URL,
  });
});

app.get('/sign-up', (_req: any, res: any) => {
  return res.render('sign-up.ejs', {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    signUpUrl: process.env.CLERK_SIGN_UP_URL,
  });
});

app.get('/protected', (_req: any, res: any) => {
  return res.render('protected.ejs', {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    signInUrl: process.env.CLERK_SIGN_IN_URL,
    signUpUrl: process.env.CLERK_SIGN_UP_URL,
  });
});

// Handle authentication error, otherwise application will crash
// @ts-ignore
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    res.status(401).end();
    return;
  }

  return next();
});

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(app, port, () => console.log(`Server is listening on port ${port}...`));
