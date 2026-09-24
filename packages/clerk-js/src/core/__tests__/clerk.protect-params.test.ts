import type { ProtectAssertion } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Clerk } from '../clerk';

/**
 * Two independent Protect features feed the single `getProtectParams` hook the FAPI client calls:
 * the application-supplied assertion, and the server-configured session token. They are wired in
 * the same expression, so collapsing it to either one alone still compiles, still type-checks, and
 * silently stops sending the other's params — a degradation with nothing to see. These tests pin
 * the hook to the union.
 */

const getRequestParams = vi.fn();

vi.mock('../protect', () => ({
  Protect: class {
    load = vi.fn();
    getRequestParams = getRequestParams;
  },
}));

const { capturedOptions } = vi.hoisted(() => ({ capturedOptions: { current: undefined as any } }));

vi.mock('../fapiClient', async importOriginal => {
  const actual = await importOriginal<typeof import('../fapiClient')>();
  return {
    ...actual,
    createFapiClient: (options: any) => {
      capturedOptions.current = options;
      return actual.createFapiClient(options);
    },
  };
});

const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';

const sessionParams = { __clerk_protect_token: 'v1.payload.mac', __clerk_protect_status: 'ok' };
const assertionParams = { __clerk_protect_assertion: 'token-abc' };

/** The hook a freshly constructed Clerk handed to the FAPI client. */
const hookFor = (assertion?: ProtectAssertion) => {
  const clerk = new Clerk(productionPublishableKey);
  if (assertion !== undefined) {
    clerk.setProtectAssertion(assertion);
  }
  return capturedOptions.current.getProtectParams as () => Promise<Record<string, string | undefined> | undefined>;
};

describe('Clerk getProtectParams', () => {
  beforeEach(() => {
    getRequestParams.mockReset();
    capturedOptions.current = undefined;
  });

  it('is wired into the FAPI client', () => {
    expect(hookFor()).toBeTypeOf('function');
  });

  it('unions the assertion and the session token', async () => {
    getRequestParams.mockResolvedValue(sessionParams);

    await expect(hookFor('token-abc')()).resolves.toEqual({ ...assertionParams, ...sessionParams });
  });

  it('sends the session token when no assertion is configured', async () => {
    getRequestParams.mockResolvedValue(sessionParams);

    await expect(hookFor()()).resolves.toEqual(sessionParams);
  });

  it('sends the assertion when the session contributes nothing', async () => {
    getRequestParams.mockResolvedValue(undefined);

    await expect(hookFor('token-abc')()).resolves.toEqual(assertionParams);
  });

  // Returning `{}` would make every sign-in body differ from what it was before the feature existed.
  it('resolves to undefined when neither contributes anything', async () => {
    getRequestParams.mockResolvedValue(undefined);

    await expect(hookFor()()).resolves.toBeUndefined();
  });

  // Neither feature may take the other down with it.
  it('keeps the session token when the assertion resolver throws', async () => {
    getRequestParams.mockResolvedValue(sessionParams);

    await expect(
      hookFor(() => {
        throw new Error('boom');
      })(),
    ).resolves.toEqual(sessionParams);
  });

  it('keeps the assertion when acquiring the session token rejects', async () => {
    getRequestParams.mockRejectedValue(new DOMException('storage is blocked', 'SecurityError'));

    await expect(hookFor('token-abc')()).resolves.toEqual(assertionParams);
  });
});
