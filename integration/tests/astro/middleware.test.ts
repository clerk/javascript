import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';

const middlewareFile = () => `import { clerkMiddleware } from '@clerk/astro/server';

export const onRequest = clerkMiddleware();
`;

const apiRouteFile = () => `import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ locals }) => {
  const { userId } = locals.auth();

  if (!userId) {
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }

  return Response.json({ status: 'ok' });
};
`;

// Paths using URL encoding tricks that historically diverged between
// middleware path matching and Astro's routing normalization. With the auth
// check on the endpoint itself, the exact router outcome (401 vs 404 vs 500)
// is Astro's business; what must always hold is that none of these serve the
// protected resource.
const trickPaths = [
  // double-encoded
  '/api/%2561dmin/users',
  // encoded slash is not a path separator
  '/api%2Fadmin/users',
  // null byte
  '/api/admin%00/users',
  // malformed percent-encoding
  '/api/%zz/users',
  // encoded dot segments and traversal
  '/api/%2e/admin/users',
  '/api/%2e%2e/admin/users',
  '/api/foo/%2e%2e/admin/users',
  // fully encoded './' and '../'
  '/api%2f%2e%2fadmin/users',
  '/api%2f%2e%2e%2fadmin/users',
  '/api/foo%2f%2e%2e%2fadmin/users',
  // double slashes
  '//api/admin/users',
  '/api//admin/users',
];

test.describe('resource-based route protection @astro', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000);

    app = await appConfigs.astro.node
      .clone()
      .setName('astro-custom-middleware')
      .addFile('src/middleware.ts', middlewareFile)
      .addFile('src/pages/api/admin/[...action].ts', apiRouteFile)
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withCustomRoles);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('baseline: unauthenticated request to protected route returns 401', async () => {
    const res = await fetch(app.serverUrl + '/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('percent-encoded paths that resolve to the protected route return 401', async () => {
    // %61 = 'a', %64 = 'd': the dev server normalizes these to
    // /api/admin/users, so the request reaches the admin endpoint where the
    // auth check rejects it
    for (const path of ['/api/%61dmin/users', '/api/a%64min/users']) {
      const res = await fetch(app.serverUrl + path);
      expect(res.status, `expected 401 for ${path}`).toBe(401);
    }
  });

  test('no URL encoding trick can access the protected route', async () => {
    for (const path of trickPaths) {
      const res = await fetch(app.serverUrl + path);
      expect(res.status, `expected non-200 for ${path}`).not.toBe(200);
    }
  });
});

test.describe('resource-based route protection @astro (production build)', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(120_000);

    app = await appConfigs.astro.node
      .clone()
      .setName('astro-custom-middleware-prod')
      .addFile('src/middleware.ts', middlewareFile)
      .addFile('src/pages/api/admin/[...action].ts', apiRouteFile)
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withCustomRoles);
    await app.build();
    await app.serve();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('baseline: unauthenticated request to protected route returns 401', async () => {
    const res = await fetch(app.serverUrl + '/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('percent-encoded paths that resolve to the protected route return 401', async () => {
    // The production router resolves these encoded paths to the admin
    // endpoint, where the auth check rejects the unauthenticated request
    for (const path of ['/api/%61dmin/users', '/api/a%64min/users']) {
      const res = await fetch(app.serverUrl + path);
      expect(res.status, `expected 401 for ${path}`).toBe(401);
    }
  });

  test('no URL encoding trick can access the protected route', async () => {
    for (const path of trickPaths) {
      const res = await fetch(app.serverUrl + path);
      expect(res.status, `expected non-200 for ${path}`).not.toBe(200);
    }
  });
});
