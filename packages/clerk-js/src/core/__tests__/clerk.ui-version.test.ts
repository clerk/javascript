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

describe('Clerk.__internal_uiSupports', () => {
  let clerk: Clerk;

  beforeEach(() => {
    clerk = new Clerk(publishableKey);
  });

  afterEach(() => {
    delete (window as any).__internal_ClerkUICtor;
    vi.restoreAllMocks();
  });

  it('returns true when no @clerk/ui is configured', () => {
    expect(clerk.__internal_uiSupports('second_factor:passkey')).toBe(true);
  });

  it('returns true when the loaded @clerk/ui declares the capability', () => {
    (window as any).__internal_ClerkUICtor = { version: '1.39.0', __internal_capabilities: ['second_factor:passkey'] };
    expect(clerk.__internal_uiSupports('second_factor:passkey')).toBe(true);
  });

  it('returns false when the loaded @clerk/ui predates capability declarations', () => {
    (window as any).__internal_ClerkUICtor = { version: '1.38.0' };
    expect(clerk.__internal_uiSupports('second_factor:passkey')).toBe(false);
  });

  it('returns false when the loaded @clerk/ui does not declare the capability', () => {
    (window as any).__internal_ClerkUICtor = { version: '1.39.0', __internal_capabilities: [] };
    expect(clerk.__internal_uiSupports('second_factor:passkey')).toBe(false);
  });

  it('checks the bundled @clerk/ui constructor', async () => {
    const ClerkUI = vi.fn();
    Object.assign(ClerkUI, { version: '1.38.0' });
    await clerk.load({ ui: { ClerkUI: ClerkUI as any } }).catch(() => {});
    expect(clerk.__internal_uiSupports('second_factor:passkey')).toBe(false);
  });

  it('returns false until a bundled @clerk/ui constructor promise resolves, then checks it', async () => {
    let resolveCtor!: (ctor: any) => void;
    const ctorPromise = new Promise(resolve => {
      resolveCtor = resolve;
    });
    const loading = clerk.load({ ui: { ClerkUI: ctorPromise as any } }).catch(() => {});
    expect(clerk.__internal_uiSupports('second_factor:passkey')).toBe(false);

    const ClerkUI = vi.fn();
    Object.assign(ClerkUI, { version: '1.39.0', __internal_capabilities: ['second_factor:passkey'] });
    resolveCtor(ClerkUI);
    await ctorPromise;
    await loading;
    expect(clerk.__internal_uiSupports('second_factor:passkey')).toBe(true);
    expect(clerk.uiVersion).toBe('1.39.0');
  });
});
