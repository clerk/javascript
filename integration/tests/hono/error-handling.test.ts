import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('error handling tests for @hono', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  test('direct API call without browser cookies returns null userId', async () => {
    const url = new URL('/api/me', app.serverUrl);
    const res = await fetch(url.toString());

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.userId).toBeNull();
  });

  test('request with invalid Authorization header is handled gracefully', async () => {
    const url = new URL('/api/me', app.serverUrl);
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: 'Bearer invalid_token_here',
      },
    });

    // Clerk middleware treats an invalid bearer token as unauthenticated (not a crash)
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.userId).toBeNull();
  });

  test('request with malformed cookie is handled gracefully', async () => {
    const url = new URL('/api/me', app.serverUrl);
    const res = await fetch(url.toString(), {
      headers: {
        Cookie: '__session=malformed_jwt_value; __client_uat=0',
      },
    });

    // Clerk middleware handles malformed cookies gracefully, treating the request as unauthenticated
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.userId).toBeNull();
  });

  test('non-existent API route returns 404', async () => {
    const url = new URL('/api/this-route-does-not-exist', app.serverUrl);
    const res = await fetch(url.toString());

    expect(res.status).toBe(404);
  });
});
