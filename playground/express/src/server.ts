import type { Application, Request, Response, NextFunction } from 'express';

import { clerkMiddleware } from '@clerk/express';
import * as express from 'express';
import { privateRoutes, publicRoutes } from './routes';

import './loadEnv';

const port = process.env.PORT || 3000;
const app: Application = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(clerkMiddleware());

app.use(publicRoutes);
app.use(privateRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
