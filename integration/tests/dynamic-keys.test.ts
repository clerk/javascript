import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

const middlewareFile = () => `import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
        import { NextResponse } from 'next/server';

        const isProtectedRoute = createRouteMatcher(['/protected', '/api/admin(.*)']);
        const shouldFetchBapi = createRouteMatcher(['/fetch-bapi-from-middleware']);

        export default clerkMiddleware(async (auth, request) => {
          if (isProtectedRoute(request)) {
            await auth.protect();
          }

          if (shouldFetchBapi(request)){
            const client = await clerkClient();

            const count = await client.users?.getCount();

            if (count){
              return NextResponse.redirect(new URL('/users-count', request.url));
            }
          }
        }, {
          secretKey: process.env.CLERK_DYNAMIC_SECRET_KEY,
          signInUrl: '/foobar'
        });

        export const config = {
          matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
        };`;

const apiRouteFile = () => `export async function GET(request, { params }) {
          const { module: mod, action } = await params;
          return Response.json({ module: mod, action: action.join('/') });
        }`;

const usersCountFile = () => `import { clerkClient } from '@clerk/nextjs/server'

        export default async function Page(){
          const count = await clerkClient().users?.getCount() ?? 0;

          return <p>Users count: {count}</p>
        }
        `;

test.describe('dynamic keys @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    app = await appConfigs.next.appRouter
      .clone()
      .addFile('src/middleware.ts', middlewareFile)
      .addFile('src/app/api/[module]/[...action]/route.ts', apiRouteFile)
      .addFile('src/app/users-count/page.tsx', usersCountFile)
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withDynamicKeys);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('redirects to `signInUrl` on `await auth.protect()`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToAppHome();

    await u.po.expect.toBeSignedOut();

    await u.page.goToRelative('/protected');

    await u.page.waitForURL(/foobar/);
  });

  test('resolves auth signature with `secretKey` on `await auth.protect()`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/page-protected');
    await u.page.waitForURL(/foobar/);
  });

  test('calls `clerkClient` with dynamic keys from application runtime', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/users-count');
    await expect(u.page.getByText(/Users count/i)).toBeVisible();
  });

  test('calls `clerkClient` with dynamic keys from middleware runtime', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/fetch-bapi-from-middleware');
    await u.page.waitForAppUrl('/users-count');
    await expect(u.page.getByText(/Users count/i)).toBeVisible();
  });
});

test.describe('percent-encoded URL handling @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000);
    app = await appConfigs.next.appRouter
      .clone()
      .addFile('src/middleware.ts', middlewareFile)
      .addFile('src/app/api/[module]/[...action]/route.ts', apiRouteFile)
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withDynamicKeys);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('handle percent-encoded URL on protected API routes', async () => {
    // auth.protect() returns 404 for unauthenticated non-page requests
    const normalRes = await fetch(app.serverUrl + '/api/admin/users');
    expect(normalRes.status).toBe(404);

    // %61 = 'a': /api/%61dmin/users decodes to /api/admin/users
    const encodedRes = await fetch(app.serverUrl + '/api/%61dmin/users');
    expect(encodedRes.status).toBe(404);

    // %64 = 'd': /api/a%64min/users decodes to /api/admin/users
    const encodedRes2 = await fetch(app.serverUrl + '/api/a%64min/users');
    expect(encodedRes2.status).toBe(404);
  });

  test('double-encoded URLs do not resolve to admin (Next.js dynamic route)', async () => {
    // %2561 decodes one layer to %61 — the catch-all [module] route matches
    // with module='%61dmin' (not 'admin'), so it's not an admin request.
    // Returns 200 because the catch-all route handles it, but the param is safe.
    const res = await fetch(app.serverUrl + '/api/%2561dmin/users');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.module).not.toBe('admin');
  });

  test('encoded slash is not decoded into a path separator', async () => {
    // %2F is a reserved delimiter — decodeURI preserves it, so the matcher
    // sees /api%2Fadmin/users which does not match /api/admin(.*).
    // The router also treats %2F as a literal segment char, not a separator.
    const res = await fetch(app.serverUrl + '/api%2Fadmin/users');
    expect(res.status).toBe(404);
  });

  test('null byte in path is caught by middleware as protected route', async () => {
    // %00 decodes to a null char — /api/admin\0/users still matches
    // /api/admin(.*) so our middleware correctly blocks it with auth.protect()
    // which returns 404 for unauthenticated non-page requests
    const res = await fetch(app.serverUrl + '/api/admin%00/users');
    expect(res.status).toBe(404);
  });

  test('malformed percent-encoding returns 400 (MalformedURLError)', async () => {
    // %zz is not valid percent-encoding — our MalformedURLError handler
    // in clerkMiddleware catches the error and returns 400
    const res = await fetch(app.serverUrl + '/api/%zz/users');
    expect(res.status).toBe(400);
  });

  test('encoded dot-current segment is rejected (Next.js router rejects)', async () => {
    // %2e = '.' — Next.js does not resolve encoded dot segments in routing,
    // so /api/%2e/admin/users doesn't match any route, returning 404
    const res = await fetch(app.serverUrl + '/api/%2e/admin/users');
    expect(res.status).toBe(404);
  });

  test('encoded dot-parent segment is rejected (Next.js router rejects)', async () => {
    // %2e%2e = '..' — Next.js does not resolve encoded dot segments,
    // returning 404
    const res = await fetch(app.serverUrl + '/api/%2e%2e/admin/users');
    expect(res.status).toBe(404);
  });

  test('encoded dot-parent traversal is rejected (Next.js router rejects)', async () => {
    // /api/foo/%2e%2e/admin/users — Next.js treats %2e%2e as a literal
    // path segment, not a traversal directive, returning 404
    const res = await fetch(app.serverUrl + '/api/foo/%2e%2e/admin/users');
    expect(res.status).toBe(404);
  });

  test('fully encoded dot segments with encoded slash', async () => {
    // %2e%2f = './', %2e%2e%2f = '../' — when the slash is also encoded,
    // Next.js treats the entire sequence as a single path segment
    const dotSlashCurrent = await fetch(app.serverUrl + '/api%2f%2e%2fadmin/users');
    expect(dotSlashCurrent.status).toBe(404);

    const dotSlashParent = await fetch(app.serverUrl + '/api%2f%2e%2e%2fadmin/users');
    expect(dotSlashParent.status).toBe(404);

    // The traversal variant hits the catch-all [module] route with
    // module='foo/../admin' (not 'admin'), so it's not a bypass
    const dotSlashTraversal = await fetch(app.serverUrl + '/api/foo%2f%2e%2e%2fadmin/users');
    expect(dotSlashTraversal.status).toBe(200);
    const body = await dotSlashTraversal.json();
    expect(body.module).not.toBe('admin');
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
