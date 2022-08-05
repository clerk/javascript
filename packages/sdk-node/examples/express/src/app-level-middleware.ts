/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */

import dotenv from 'dotenv';
dotenv.config();

import {
  ClerkExpressRequireAuth,
  StrictAuthProp,
  WithAuthProp,
} from '@clerk/clerk-sdk-node';
import express, { Application, Request, Response } from 'express';

const port = process.env.PORT || 3000;

const app: Application = express();

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

app.use(ClerkExpressRequireAuth());

app.get('/', (req: WithAuthProp<Request>, res: Response) => {
  res.json(req.auth);
});

// @ts-ignore
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
