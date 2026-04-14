import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';

const middlewareFile = () => `import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isProtectedRoute = createRouteMatcher(['/api/admin(.*)']);

export const onRequest = clerkMiddleware((auth, context, next) => {
  if (isProtectedRoute(context.request) && !auth().userId) {
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }
  return next();
});
`;

const apiRouteFile = () => `import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return Response.json({ status: 'ok' });
};
`;

test.describe('custom middleware @astro', () => {
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

  test('handle percent-encoded URL on protected routes', async () => {
    // %61 = 'a': /api/%61dmin/users decodes to /api/admin/users
    // Note: Astro's dev server normalizes percent-encoded URLs before
    // the middleware runs, so this test validates the full pipeline.
    // The decodeURIComponent in createPathMatcher provides defense-in-depth
    // for environments that don't normalize (e.g., raw Node.js, Edge).
    const encodedRes = await fetch(app.serverUrl + '/api/%61dmin/users');
    expect(encodedRes.status).toBe(401);

    // %64 = 'd': /api/a%64min/users decodes to /api/admin/users
    const encodedRes2 = await fetch(app.serverUrl + '/api/a%64min/users');
    expect(encodedRes2.status).toBe(401);
  });

  test('double-encoded URLs do not match route (Astro router rejects)', async () => {
    // %2561 decodes one layer to %61 — Astro's file-based router does not
    // match %2561dmin to the admin/ directory, returning 404
    const res = await fetch(app.serverUrl + '/api/%2561dmin/users');
    expect(res.status).toBe(404);
  });

  test('encoded slash is not decoded into a path separator', async () => {
    // %2F is a reserved delimiter — decodeURI preserves it, so the matcher
    // sees /api%2Fadmin/users which does not match /api/admin(.*).
    // The router also treats %2F as a literal segment char, not a separator.
    const res = await fetch(app.serverUrl + '/api%2Fadmin/users');
    expect(res.status).not.toBe(200);
  });

  test('null byte in path is caught by middleware as protected route', async () => {
    // %00 decodes to a null char — /api/admin\0/users still matches
    // /api/admin(.*) so our middleware correctly blocks it with 401
    const res = await fetch(app.serverUrl + '/api/admin%00/users');
    expect(res.status).toBe(401);
  });

  test('malformed percent-encoding is rejected (Astro dev server rejects before middleware)', async () => {
    // %zz is not valid percent-encoding — Astro's Vite dev server crashes
    // on decodeURI() in the trailing-slash plugin before our middleware runs,
    // returning 500
    const res = await fetch(app.serverUrl + '/api/%zz/users');
    expect(res.status).toBe(500);
  });

  test('double slashes cannot bypass protected route', async () => {
    // Double slashes before the protected segment
    const res1 = await fetch(app.serverUrl + '//api/admin/users');
    expect(res1.status).not.toBe(200);

    // Double slashes in the middle of the path
    const res2 = await fetch(app.serverUrl + '/api//admin/users');
    expect(res2.status).not.toBe(200);
  });
});

test.describe('custom middleware @astro (production build)', () => {
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

  test('handle percent-encoded URL on protected routes', async () => {
    // Unlike the dev server (Vite), the production Node adapter does NOT
    // normalize percent-encoded URLs — this test relies on our
    // decodeURIComponent fix in createPathMatcher (verified to fail without it)
    const encodedRes = await fetch(app.serverUrl + '/api/%61dmin/users');
    expect(encodedRes.status).toBe(401);

    const encodedRes2 = await fetch(app.serverUrl + '/api/a%64min/users');
    expect(encodedRes2.status).toBe(401);
  });

  test('double-encoded URLs do not match route (Astro router rejects)', async () => {
    // %2561 decodes one layer to %61 — Astro's file-based router does not
    // match %2561dmin to the admin/ directory, returning 404
    const res = await fetch(app.serverUrl + '/api/%2561dmin/users');
    expect(res.status).toBe(404);
  });

  test('encoded slash is not decoded into a path separator', async () => {
    // %2F is a reserved delimiter — decodeURI preserves it, so the matcher
    // sees /api%2Fadmin/users which does not match /api/admin(.*).
    // The router also treats %2F as a literal segment char, not a separator.
    const res = await fetch(app.serverUrl + '/api%2Fadmin/users');
    expect(res.status).not.toBe(200);
  });

  test('null byte in path is caught by middleware as protected route', async () => {
    // %00 decodes to a null char — /api/admin\0/users still matches
    // /api/admin(.*) so our middleware correctly blocks it with 401
    const res = await fetch(app.serverUrl + '/api/admin%00/users');
    expect(res.status).toBe(401);
  });

  test('malformed percent-encoding returns 400 (clerkMiddleware catches MalformedURLError)', async () => {
    // %zz is not valid percent-encoding — createPathMatcher throws
    // MalformedURLError, which handleControlFlowErrors catches and returns 400
    const res = await fetch(app.serverUrl + '/api/%zz/users');
    expect(res.status).toBe(400);
  });

  test('double slashes cannot bypass protected route', async () => {
    // Double slashes before the protected segment
    const res1 = await fetch(app.serverUrl + '//api/admin/users');
    expect(res1.status).not.toBe(200);

    // Double slashes in the middle of the path
    const res2 = await fetch(app.serverUrl + '/api//admin/users');
    expect(res2.status).not.toBe(200);
  });
});
