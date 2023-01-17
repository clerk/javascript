import { createClerkClient, LooseAuthProp, WithAuthProp } from '@clerk/clerk-sdk-node';
import express, { Application, Request, Response } from 'express';
import { secrets } from './secrets';

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

// const clerk = new Clerk({ apiKey: secrets.CLERK_API_KEY });
// For better type support, prefer the newest createClerkClient:
const clerk = createClerkClient({ apiKey: secrets.CLERK_API_KEY });

const port = process.env.PORT || 3000;

const app: Application = express();

app.use(clerk.expressWithAuth());

app.get('/', async (req: WithAuthProp<Request>, res: Response) => {
  const { userId, debug } = req.auth;
  console.log(debug());
  const user = userId ? await clerk.users.getUser(userId) : null;
  res.json({ auth: req.auth, user });
});

// @ts-ignore
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
