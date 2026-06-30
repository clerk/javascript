import { ipcMain, shell } from 'electron';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OAUTH_TRANSPORT_CHANNELS } from '../../shared/ipc';
import { setupOAuthTransportIpcHandlers } from '../oauth-transport';

vi.mock('electron', () => ({
  app: {
    on: vi.fn(),
    removeListener: vi.fn(),
    setAsDefaultProtocolClient: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => []),
  },
}));

type Handler = (event: unknown, ...args: unknown[]) => unknown;

function getHandlers(): { getRedirectUrl?: Handler; open?: Handler } {
  const calls = vi.mocked(ipcMain.handle).mock.calls;
  return {
    getRedirectUrl: calls.find(([channel]) => channel === OAUTH_TRANSPORT_CHANNELS.getRedirectUrl)?.[1] as Handler,
    open: calls.find(([channel]) => channel === OAUTH_TRANSPORT_CHANNELS.open)?.[1] as Handler,
  };
}

describe('setupOAuthTransportIpcHandlers (http loopback)', () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.clearAllMocks();
  });

  it('serves the built-in completion page and resolves with the loopback callback URL', async () => {
    vi.mocked(shell.openExternal).mockResolvedValue(undefined);
    const port = 47654;
    cleanup = setupOAuthTransportIpcHandlers({ oauth: { redirect: { type: 'http', port } } });
    const { getRedirectUrl, open } = getHandlers();

    expect(getRedirectUrl?.({})).toBe(`http://127.0.0.1:${port}/sso-callback`);

    const openPromise = open?.({}, 'https://accounts.example.com/oauth') as Promise<{ callbackUrl: string }>;

    // The loopback server is listening once `open` has reached `shell.openExternal`.
    await vi.waitFor(() => expect(shell.openExternal).toHaveBeenCalledWith('https://accounts.example.com/oauth'));

    const callbackUrl = `http://127.0.0.1:${port}/sso-callback?__clerk_status=complete&rotating_token_nonce=abc`;
    const response = await fetch(callbackUrl);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('Sign-in complete');
    await expect(openPromise).resolves.toEqual({ callbackUrl });
  });

  it('serves custom successHtml when provided', async () => {
    vi.mocked(shell.openExternal).mockResolvedValue(undefined);
    const port = 47657;
    cleanup = setupOAuthTransportIpcHandlers({
      oauth: { redirect: { type: 'http', port, successHtml: '<h1>Custom done</h1>' } },
    });
    const { open } = getHandlers();

    void (open?.({}, 'https://accounts.example.com/oauth') as Promise<unknown>);
    await vi.waitFor(() => expect(shell.openExternal).toHaveBeenCalled());

    const response = await fetch(`http://127.0.0.1:${port}/sso-callback`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe('<h1>Custom done</h1>');
  });

  it('redirects the browser to successUrl when provided', async () => {
    vi.mocked(shell.openExternal).mockResolvedValue(undefined);
    const port = 47658;
    cleanup = setupOAuthTransportIpcHandlers({
      oauth: { redirect: { type: 'http', port, successUrl: 'https://myapp.example/signed-in' } },
    });
    const { open } = getHandlers();

    void (open?.({}, 'https://accounts.example.com/oauth') as Promise<unknown>);
    await vi.waitFor(() => expect(shell.openExternal).toHaveBeenCalled());

    const response = await fetch(`http://127.0.0.1:${port}/sso-callback`, { redirect: 'manual' });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://myapp.example/signed-in');
  });

  it('refuses to open a non-http(s) OAuth URL', async () => {
    cleanup = setupOAuthTransportIpcHandlers({ oauth: { redirect: { type: 'http', port: 47655 } } });
    const { open } = getHandlers();

    await expect(open?.({}, 'clerk://app/')).rejects.toThrow('unsupported OAuth URL protocol');
  });

  it('rejects a second concurrent OAuth flow', async () => {
    vi.mocked(shell.openExternal).mockResolvedValue(undefined);
    const port = 47656;
    cleanup = setupOAuthTransportIpcHandlers({ oauth: { redirect: { type: 'http', port } } });
    const { open } = getHandlers();

    const first = open?.({}, 'https://accounts.example.com/oauth') as Promise<unknown>;
    await vi.waitFor(() => expect(shell.openExternal).toHaveBeenCalled());

    await expect(open?.({}, 'https://accounts.example.com/oauth')).rejects.toThrow('an OAuth flow is already pending');

    // Resolve the first flow so the server/timeout are cleaned up.
    await fetch(`http://127.0.0.1:${port}/sso-callback`);
    await first;
  });
});
