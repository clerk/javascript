import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Clerk } from '../clerk';
import type * as FapiClientModule from '../fapiClient';

/**
 * Pins the `getProtectParams` hook Clerk hands the FAPI client. Dropping it still compiles and
 * type-checks, and silently stops sending the params.
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
  const actual = await importOriginal<typeof FapiClientModule>();
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

/** The hook a freshly constructed Clerk handed to the FAPI client. */
const hook = () => {
  new Clerk(productionPublishableKey);
  return capturedOptions.current.getProtectParams as () => Promise<Record<string, string | undefined> | undefined>;
};

describe('Clerk getProtectParams', () => {
  beforeEach(() => {
    getRequestParams.mockReset();
    capturedOptions.current = undefined;
  });

  it('is wired into the FAPI client', () => {
    expect(hook()).toBeTypeOf('function');
  });

  it('sends the session params', async () => {
    getRequestParams.mockResolvedValue(sessionParams);

    await expect(hook()()).resolves.toEqual(sessionParams);
  });

  // Returning `{}` would make every sign-in body differ from what it was before the feature existed.
  it('resolves to undefined when there is nothing to send', async () => {
    getRequestParams.mockResolvedValue(undefined);

    await expect(hook()()).resolves.toBeUndefined();
  });
});
