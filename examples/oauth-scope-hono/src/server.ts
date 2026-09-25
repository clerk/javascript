/* eslint-disable turbo/no-undeclared-env-vars */
import 'dotenv/config';

import { clerkMiddleware, getAuth } from '@clerk/hono';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? '8787');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid RESOURCE_SERVER_PORT: ${value}`);
  }
  return port;
};

const requiredScope = process.env.OAUTH_REQUIRED_SCOPE?.trim() || 'profile';
const hostname = process.env.RESOURCE_SERVER_HOST?.trim() || '127.0.0.1';
const port = parsePort(process.env.RESOURCE_SERVER_PORT);

const app = new Hono();
// Middleware
app.use(clerkMiddleware());

// Public route
app.get('/', c =>
  c.json({
    protectedUrl: `/protected`,
    requiredScope,
  }),
);

// Protected route
app.get('/protected', c => {
  const auth = getAuth(c, { acceptsToken: 'oauth_token' });

  // Authentication check
  if (!auth.isAuthenticated) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Authorization check — 🆕 `oauth_scope` check.
  if (!auth.has({ oauth_scope: requiredScope })) {
    return c.json(
      {
        error: 'Not authorized',
        meta: { requiredScope, grantedScopes: auth.scopes },
      },
      403,
    );
  }

  // Authenticated and authorized at this point.

  return c.json({
    authorized: true,
    requiredScope,
    grantedScopes: auth.scopes,
    tokenType: auth.tokenType,
    subject: auth.subject,
    userId: auth.userId,
  });
});

showRoutes(app, { verbose: true });

const server = serve({ fetch: app.fetch, hostname, port }, info => {
  console.log(`OAuth scope resource server listening on http://${info.address}:${info.port}`);
  console.log(`Required scope: ${requiredScope}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
  });
}
