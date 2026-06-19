import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { RouterContextProvider } from 'react-router';

import * as build from './build/server/index.js';

/**
 * Deliberately misconfigured server, used by the cross-user auth isolation e2e.
 *
 * `getLoadContext` returns ONE `RouterContextProvider` that is reused for every request
 * instead of a fresh instance per request. This is the footgun Clerk's docs warn against
 * (a custom server or `getLoadContext` that returns a single context). With a shared context,
 * `@clerk/react-router` must still resolve each request's auth from that request, so two
 * concurrent users never get served each other's identity.
 */
const sharedContext = new RouterContextProvider();

const app = express();
app.disable('x-powered-by');

// Serve the static client bundle produced by `react-router build`.
app.use(express.static('build/client', { maxAge: '1h' }));

app.all(
  '*',
  createRequestHandler({
    build,
    getLoadContext() {
      return sharedContext;
    },
  }),
);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`react-router-node-shared-context listening on http://localhost:${port}`);
});
