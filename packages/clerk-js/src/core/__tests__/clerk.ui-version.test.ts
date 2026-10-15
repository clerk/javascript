import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Clerk } from '../clerk';
import { Client, Environment } from '../resources/internal';

vi.mock('../resources/Client');
vi.mock('../resources/Environment');

vi.mock('../auth/devBrowser', () => ({
  createDevBrowser: () => ({
    clear: vi.fn(),
    setup: vi.fn(),
    getDevBrowser: vi.fn(() => 'deadbeef'),
    setDevBrowser: vi.fn(),
    removeDevBrowser: vi.fn(),
    refreshCookies: vi.fn(),
  }),
}));

Client.getOrCreateInstance = vi.fn().mockImplementation(() => ({ fetch: vi.fn() }));
Environment.getInstance = vi.fn().mockImplementation(() => ({ fetch: vi.fn(() => Promise.resolve({})) }));

const publishableKey = 'pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ';

describe('Clerk.uiVersion', () => {
  let clerk: Clerk;

  beforeEach(() => {
    clerk = new Clerk(publishableKey);
  });

  afterEach(() => {
    delete (window as any).__internal_ClerkUICtor;
    vi.restoreAllMocks();
  });

  it('exposes the property on the instance', () => {
    expect('uiVersion' in clerk).toBe(true);
  });

  it('returns undefined when the @clerk/ui bundle has not loaded', () => {
    expect((window as any).__internal_ClerkUICtor).toBeUndefined();
    expect(clerk.uiVersion).toBeUndefined();
  });

  it('returns the version published by the loaded @clerk/ui constructor', () => {
    (window as any).__internal_ClerkUICtor = { version: '1.18.1' };
    expect(clerk.uiVersion).toBe('1.18.1');
  });

  it('reports a UI version independent of the clerk-js version', () => {
    (window as any).__internal_ClerkUICtor = { version: '1.18.1' };
    expect(clerk.uiVersion).not.toBe(clerk.version);
  });
});
