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

  test('handle percent-encoded URL on protected routes', async () => {
    // %61 = 'a': /api/%61dmin/users decodes to /api/admin/users
    // Astro's dev server normalizes percent-encoded URLs before routing,
    // so the request reaches the admin endpoint where the auth check
    // rejects it with 401
    const encodedRes = await fetch(app.serverUrl + '/api/%61dmin/users');
    expect(encodedRes.status).toBe(401);

    // %64 = 'd': /api/a%64min/users decodes to /api/admin/users
    const encodedRes2 = await fetch(app.serverUrl + '/api/a%64min/users');
    expect(encodedRes2.status).toBe(401);
  });

  test('double-encoded URLs do not match route (Astro router rejects)', async () => {
    // %2561 decodes one layer to %61, and Astro's dev router does not
    // match %2561dmin to the admin/ directory, returning 404
    const res = await fetch(app.serverUrl + '/api/%2561dmin/users');
    expect(res.status).toBe(404);
  });

  test('encoded slash is not decoded into a path separator', async () => {
    // %2F is a reserved delimiter: the router treats it as a literal
    // segment char, not a separator, so /api%2Fadmin/users matches no route
    const res = await fetch(app.serverUrl + '/api%2Fadmin/users');
    expect(res.status).not.toBe(200);
  });

  test('null byte in path cannot access protected route', async () => {
    // %00 decodes to a null char: /api/admin\0/users is not the admin/
    // directory; if a router ever resolved it to the admin endpoint anyway,
    // the endpoint's own auth check would still return 401
    const res = await fetch(app.serverUrl + '/api/admin%00/users');
    expect(res.status).not.toBe(200);
  });

  test('malformed percent-encoding is rejected (Astro dev server rejects before routing)', async () => {
    // %zz is not valid percent-encoding: Astro's Vite dev server crashes
    // on decodeURI() in the trailing-slash plugin, returning 500
    const res = await fetch(app.serverUrl + '/api/%zz/users');
    expect(res.status).toBe(500);
  });

  test('encoded dot-current segment is caught by resource check', async () => {
    // %2e = '.': /api/%2e/admin/users resolves to /api/./admin/users → /api/admin/users
    // The request reaches the admin endpoint, whose auth check returns 401
    const res = await fetch(app.serverUrl + '/api/%2e/admin/users');
    expect(res.status).toBe(401);
  });

  test('encoded dot-parent segment does not reach protected route', async () => {
    // %2e%2e = '..': /api/%2e%2e/admin/users resolves to /api/../admin/users → /admin/users
    // This doesn't match any route, returning 404
    const res = await fetch(app.serverUrl + '/api/%2e%2e/admin/users');
    expect(res.status).toBe(404);
  });

  test('encoded dot-parent traversal through fake segment is caught by resource check', async () => {
    // /api/foo/%2e%2e/admin/users resolves to /api/foo/../admin/users → /api/admin/users
    // The request reaches the admin endpoint, whose auth check returns 401
    const res = await fetch(app.serverUrl + '/api/foo/%2e%2e/admin/users');
    expect(res.status).toBe(401);
  });

  test('fully encoded dot segments with encoded slash are rejected', async () => {
    // %2e%2f = './', %2e%2e%2f = '../': when the slash is also encoded,
    // the entire sequence is treated as a single path segment by the router
    const dotSlashCurrent = await fetch(app.serverUrl + '/api%2f%2e%2fadmin/users');
    expect(dotSlashCurrent.status).toBe(404);

    const dotSlashParent = await fetch(app.serverUrl + '/api%2f%2e%2e%2fadmin/users');
    expect(dotSlashParent.status).toBe(404);

    const dotSlashTraversal = await fetch(app.serverUrl + '/api/foo%2f%2e%2e%2fadmin/users');
    expect(dotSlashTraversal.status).toBe(404);
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

  test('handle percent-encoded URL on protected routes', async () => {
    // The production router resolves percent-encoded paths to the admin
    // endpoint, where the auth check rejects the unauthenticated request
    const encodedRes = await fetch(app.serverUrl + '/api/%61dmin/users');
    expect(encodedRes.status).toBe(401);

    const encodedRes2 = await fetch(app.serverUrl + '/api/a%64min/users');
    expect(encodedRes2.status).toBe(401);
  });

  test('double-encoded URLs cannot access protected route', async () => {
    // Astro 7's production router resolves %2561dmin to the admin endpoint,
    // which previously diverged from middleware path matching and could
    // bypass it. With the auth check on the endpoint itself, routing
    // normalization no longer matters: a request that reaches the endpoint
    // unauthenticated gets 401, and one that doesn't gets 404
    const res = await fetch(app.serverUrl + '/api/%2561dmin/users');
    expect(res.status).not.toBe(200);
  });

  test('encoded slash is not decoded into a path separator', async () => {
    // %2F is a reserved delimiter: the router treats it as a literal
    // segment char, not a separator, so /api%2Fadmin/users matches no route
    const res = await fetch(app.serverUrl + '/api%2Fadmin/users');
    expect(res.status).not.toBe(200);
  });

  test('null byte in path cannot access protected route', async () => {
    // %00 decodes to a null char: /api/admin\0/users is not the admin/
    // directory; if a router ever resolved it to the admin endpoint anyway,
    // the endpoint's own auth check would still return 401
    const res = await fetch(app.serverUrl + '/api/admin%00/users');
    expect(res.status).not.toBe(200);
  });

  test('malformed percent-encoding cannot access protected route', async () => {
    // %zz is not valid percent-encoding: it cannot resolve to the admin
    // endpoint, and even if it did, the auth check would return 401
    const res = await fetch(app.serverUrl + '/api/%zz/users');
    expect(res.status).not.toBe(200);
  });

  test('encoded dot-current segment is caught by resource check', async () => {
    // %2e = '.': /api/%2e/admin/users resolves to /api/./admin/users → /api/admin/users
    // The request reaches the admin endpoint, whose auth check returns 401
    const res = await fetch(app.serverUrl + '/api/%2e/admin/users');
    expect(res.status).toBe(401);
  });

  test('encoded dot-parent segment does not reach protected route', async () => {
    // %2e%2e = '..': /api/%2e%2e/admin/users resolves to /api/../admin/users → /admin/users
    // This doesn't match any route, returning 404
    const res = await fetch(app.serverUrl + '/api/%2e%2e/admin/users');
    expect(res.status).toBe(404);
  });

  test('encoded dot-parent traversal through fake segment is caught by resource check', async () => {
    // /api/foo/%2e%2e/admin/users resolves to /api/foo/../admin/users → /api/admin/users
    // The request reaches the admin endpoint, whose auth check returns 401
    const res = await fetch(app.serverUrl + '/api/foo/%2e%2e/admin/users');
    expect(res.status).toBe(401);
  });

  test('fully encoded dot segments with encoded slash are rejected', async () => {
    // %2e%2f = './', %2e%2e%2f = '../': when the slash is also encoded,
    // the entire sequence is treated as a single path segment by the router
    const dotSlashCurrent = await fetch(app.serverUrl + '/api%2f%2e%2fadmin/users');
    expect(dotSlashCurrent.status).toBe(404);

    const dotSlashParent = await fetch(app.serverUrl + '/api%2f%2e%2e%2fadmin/users');
    expect(dotSlashParent.status).toBe(404);

    const dotSlashTraversal = await fetch(app.serverUrl + '/api/foo%2f%2e%2e%2fadmin/users');
    expect(dotSlashTraversal.status).toBe(404);
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
