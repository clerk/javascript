import { createClerkClient, LooseAuthProp, WithAuthProp } from '@clerk/clerk-sdk-node';
import express, { Application, Request, Response } from 'express';
import { secrets } from './secrets';

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

// const clerk = new Clerk({ secretKey: secrets.CLERK_SECRET_KEY });
// For better type support, prefer the newest createClerkClient:
const clerk = createClerkClient({ secretKey: secrets.CLERK_SECRET_KEY });

const port = process.env.PORT || 3000;

const app: Application = express();

app.use(clerk.expressWithAuth());

app.get('/', async (req: WithAuthProp<Request>, res: Response) => {
  const { userId, debug } = req.auth;
  console.log(debug());
  if (!userId) return res.json({ auth: req.auth, user: null });

  try{
    const user = await clerk.users.getUser(userId);
    return res.json({ auth: req.auth, user });
  }catch(error){
    return res.json({ auth: req.auth, user: null });
  }
});

// @ts-ignore
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
