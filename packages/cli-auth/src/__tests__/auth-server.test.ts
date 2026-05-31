import { describe, expect, it } from 'vitest';

import { startAuthServer } from '../lib/auth-server';

describe('auth server', () => {
  it('returns the authorization code and state from /callback', async () => {
    const server = await startAuthServer({
      expectedState: 'state',
      timeoutMs: 1_000,
    });
    const callback = server.waitForCallback();

    const response = await fetch(`${server.redirectUri}?code=code-123&state=state`);

    expect(response.status).toBe(200);
    await expect(callback).resolves.toEqual({
      code: 'code-123',
      state: 'state',
    });
    server.close();
  });

  it('rejects on state mismatch', async () => {
    const server = await startAuthServer({
      expectedState: 'expected',
      timeoutMs: 1_000,
    });
    const callback = server.waitForCallback().catch(error => error);

    const response = await fetch(`${server.redirectUri}?code=code-123&state=wrong`);

    expect(response.status).toBe(400);
    await expect(callback).resolves.toMatchObject({
      code: 'state_mismatch',
    });
    server.close();
  });

  it('rejects on timeout', async () => {
    const server = await startAuthServer({
      expectedState: 'state',
      timeoutMs: 25,
    });
    const callback = server.waitForCallback().catch(error => error);

    await expect(callback).resolves.toMatchObject({ code: 'timeout' });
    server.close();
  });
});
