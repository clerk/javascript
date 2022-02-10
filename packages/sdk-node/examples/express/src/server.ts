import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  RequireAuthProp,
  WithAuthProp,
} from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
dotenv.config();

const port = process.env.PORT;

const app: Application = express();

// Root path uses lax middleware
app.get(
  '/',
  ClerkExpressWithAuth(),
  (req: WithAuthProp<Request>, res: Response) => {
    res.json(req.session || 'No session detected');
  }
);

// /require-session path uses strict middleware
app.get(
  '/require-session',
  ClerkExpressRequireAuth(),
  (req: RequireAuthProp<Request>, res) => {
    res.json(req.session);
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
