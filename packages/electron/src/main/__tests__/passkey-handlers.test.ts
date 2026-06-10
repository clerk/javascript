import type { IpcMainInvokeEvent } from 'electron';
import { BrowserWindow, ipcMain } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PASSKEY_CHANNELS } from '../../shared/ipc';
import { setupPasskeysMain } from '../passkey-handlers';

const native = vi.hoisted(() => ({
  isAvailable: vi.fn(() => true),
  capabilities: vi.fn(() => ({ platformAuthenticator: true, securityKeys: true })),
  createCredential: vi.fn(),
  getCredential: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

vi.mock('@clerk/electron-passkeys', () => ({ default: native }));

type Handler = (event: IpcMainInvokeEvent, options?: unknown) => unknown;

const getHandler = (channel: string): Handler => {
  const call = vi.mocked(ipcMain.handle).mock.calls.find(([registered]) => registered === channel);
  if (!call) {
    throw new Error(`No handler registered for ${channel}`);
  }
  return call[1] as Handler;
};

const windowHandle = Buffer.from([1, 2, 3, 4]);
const event = { sender: {} } as IpcMainInvokeEvent;

const creationOptions = { challenge: 'abc', rp: { id: 'example.com', name: 'Example' } };
const registrationJSON = { id: 'cred', rawId: 'cred', type: 'public-key', response: {} };

describe('setupPasskeysMain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    native.isAvailable.mockReturnValue(true);
    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue({
      getNativeWindowHandle: () => windowHandle,
    } as unknown as BrowserWindow);
  });

  it('registers handlers for all passkey channels and cleans them up', () => {
    const { cleanup } = setupPasskeysMain();

    expect(ipcMain.handle).toHaveBeenCalledWith(PASSKEY_CHANNELS.create, expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith(PASSKEY_CHANNELS.get, expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith(PASSKEY_CHANNELS.capabilities, expect.any(Function));

    cleanup();

    expect(ipcMain.removeHandler).toHaveBeenCalledWith(PASSKEY_CHANNELS.create);
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(PASSKEY_CHANNELS.get);
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(PASSKEY_CHANNELS.capabilities);
  });

  it('relays a successful native envelope from create', async () => {
    native.createCredential.mockResolvedValue(JSON.stringify({ ok: true, credential: registrationJSON }));
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.create)(event, creationOptions);

    expect(native.createCredential).toHaveBeenCalledWith(windowHandle, JSON.stringify(creationOptions));
    expect(result).toEqual({ ok: true, credential: registrationJSON });
  });

  it('relays a native error envelope from get', async () => {
    native.getCredential.mockResolvedValue(
      JSON.stringify({ ok: false, error: { code: 'cancelled', message: 'user cancelled' } }),
    );
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.get)(event, { challenge: 'abc', rpId: 'example.com' });

    expect(result).toEqual({ ok: false, error: { code: 'cancelled', message: 'user cancelled' } });
  });

  it('returns not_supported when the native module reports unavailability', async () => {
    native.isAvailable.mockReturnValue(false);
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.create)(event, creationOptions);

    expect(result).toMatchObject({ ok: false, error: { code: 'not_supported' } });
    expect(native.createCredential).not.toHaveBeenCalled();
  });

  it('returns an error when the request does not originate from a window', async () => {
    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.create)(event, creationOptions);

    expect(result).toMatchObject({ ok: false, error: { code: 'unknown' } });
  });

  it('wraps malformed native output in an unknown error envelope', async () => {
    native.createCredential.mockResolvedValue('not json');
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.create)(event, creationOptions);

    expect(result).toMatchObject({ ok: false, error: { code: 'unknown' } });
  });

  it('rejects envelopes with unrecognized error codes', async () => {
    native.createCredential.mockResolvedValue(
      JSON.stringify({ ok: false, error: { code: 'something_else', message: 'nope' } }),
    );
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.create)(event, creationOptions);

    expect(result).toMatchObject({ ok: false, error: { code: 'unknown' } });
  });

  it('reports capabilities from the native module', async () => {
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.capabilities)(event);

    expect(result).toEqual({ available: true, platformAuthenticator: true, securityKeys: true });
  });

  it('reports unavailable capabilities when the platform is unsupported', async () => {
    native.isAvailable.mockReturnValue(false);
    setupPasskeysMain();

    const result = await getHandler(PASSKEY_CHANNELS.capabilities)(event);

    expect(result).toEqual({ available: false, platformAuthenticator: false, securityKeys: false });
  });
});
