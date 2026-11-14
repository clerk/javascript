import Module from 'node:module';

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useNativeToWeb } from '../useNativeToWeb';

const moduleWithLoad = Module as unknown as {
  _load: (request: string, parent?: unknown, isMain?: boolean) => unknown;
};
const originalModuleLoad = moduleWithLoad._load;

const mocks = vi.hoisted(() => {
  return {
    platformOS: 'ios',
    launcher: 'linking' as 'linking' | 'android',
    openURL: vi.fn(),
    addEventListener: vi.fn(),
    startActivityAsync: vi.fn(),
    intentLauncherInstalled: true,
    getClerkInstance: vi.fn(),
    request: vi.fn(),
    sessionId: 'sess_0' as string | null,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      get OS() {
        return mocks.platformOS;
      },
    },
    Linking: { openURL: mocks.openURL },
    AppState: { addEventListener: mocks.addEventListener },
  };
});

vi.mock('../launchBrowser', async () => {
  const linking = await vi.importActual<typeof import('../launchBrowser')>('../launchBrowser');
  const android = await vi.importActual<typeof import('../launchBrowser.android')>('../launchBrowser.android');
  return {
    resolveBrowserLauncher: () =>
      mocks.launcher === 'android' ? android.resolveBrowserLauncher() : linking.resolveBrowserLauncher(),
  };
});

vi.mock('../../provider/singleton', () => {
  return {
    getClerkInstance: mocks.getClerkInstance,
  };
});

const DESTINATION = 'https://app.example.com/settings';
const TRANSFER_URL = 'https://clerk.example.com/v1/session_transfers/redeem?token=one-time';

function mintedResponse() {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    payload: { response: { object: 'session_transfer', url: TRANSFER_URL, expires_at: Date.now() + 60_000 } },
  };
}

function pending<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

let sessionCount = 0;

describe('useNativeToWeb', () => {
  beforeEach(() => {
    sessionCount += 1;
    mocks.sessionId = `sess_${sessionCount}`;
    mocks.platformOS = 'ios';
    mocks.launcher = 'linking';
    mocks.intentLauncherInstalled = true;
    mocks.openURL.mockReset().mockResolvedValue(undefined);
    mocks.addEventListener.mockReset().mockReturnValue({ remove: vi.fn() });
    mocks.startActivityAsync.mockReset().mockResolvedValue({ resultCode: 0 });
    mocks.request.mockReset().mockResolvedValue(mintedResponse());
    mocks.getClerkInstance.mockReset().mockImplementation(() => ({
      loaded: true,
      session: mocks.sessionId ? { id: mocks.sessionId } : null,
      getFapiClient: () => ({ request: mocks.request }),
    }));
    vi.spyOn(moduleWithLoad, '_load').mockImplementation((request, parent, isMain) => {
      if (request === 'expo-intent-launcher') {
        if (!mocks.intentLauncherInstalled) {
          throw new Error("Cannot find module 'expo-intent-launcher'");
        }
        return { startActivityAsync: mocks.startActivityAsync };
      }
      if (request === 'expo-application') {
        return { applicationId: 'com.example.app' };
      }
      return originalModuleLoad.call(Module, request, parent, isMain);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns the same openExternalBrowser on every render', () => {
    const { result, rerender } = renderHook(() => useNativeToWeb());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
    expect(result.current.openExternalBrowser).toBe(first.openExternalBrowser);
  });

  test('mints a browser transfer and opens it', async () => {
    const { openExternalBrowser } = useNativeToWeb();

    await openExternalBrowser({ destination: DESTINATION });

    expect(mocks.request).toHaveBeenCalledWith(
      expect.objectContaining({ body: { redirectUrl: DESTINATION, presentationMode: 'browser' } }),
    );
    expect(mocks.openURL).toHaveBeenCalledWith(TRANSFER_URL);
  });

  test('shares one mint and one launch between overlapping calls', async () => {
    const { openExternalBrowser } = useNativeToWeb();

    const first = openExternalBrowser({ destination: DESTINATION });
    const second = openExternalBrowser({ destination: DESTINATION });
    await Promise.all([first, second]);

    expect(second).toBe(first);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(mocks.openURL).toHaveBeenCalledTimes(1);
  });

  test('joins the open in flight after its URL was claimed', async () => {
    const opened = pending<void>();
    mocks.openURL.mockReturnValue(opened.promise);
    const { openExternalBrowser } = useNativeToWeb();

    const first = openExternalBrowser({ destination: DESTINATION });
    await vi.waitFor(() => expect(mocks.openURL).toHaveBeenCalledTimes(1));
    const second = openExternalBrowser({ destination: DESTINATION });
    opened.resolve();
    await Promise.all([first, second]);

    expect(second).toBe(first);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(mocks.openURL).toHaveBeenCalledTimes(1);
  });

  test('mints again once the previous open finished', async () => {
    const { openExternalBrowser } = useNativeToWeb();

    await openExternalBrowser({ destination: DESTINATION });
    await openExternalBrowser({ destination: DESTINATION });

    expect(mocks.request).toHaveBeenCalledTimes(2);
    expect(mocks.openURL).toHaveBeenCalledTimes(2);
  });

  test('rejects with browser_unavailable without exposing the URL', async () => {
    mocks.openURL.mockRejectedValue(new Error(`Unable to open URL: ${TRANSFER_URL}`));
    const { openExternalBrowser } = useNativeToWeb();

    const error = await openExternalBrowser({ destination: DESTINATION }).then(
      () => null,
      (e: unknown) => e,
    );

    expect(error).toMatchObject({ name: 'SessionTransferError', code: 'browser_unavailable' });
    expect(error).not.toHaveProperty('cause');
    expect(JSON.stringify(error)).not.toContain('one-time');
    expect(String(error)).not.toContain('one-time');
  });

  test('rejects with signed_out without minting', async () => {
    mocks.sessionId = null;
    const { openExternalBrowser } = useNativeToWeb();

    await expect(openExternalBrowser({ destination: DESTINATION })).rejects.toMatchObject({ code: 'signed_out' });
    expect(mocks.request).not.toHaveBeenCalled();
  });

  test('rejects with unsupported_platform on web', async () => {
    mocks.platformOS = 'web';
    const { openExternalBrowser } = useNativeToWeb();

    await expect(openExternalBrowser({ destination: DESTINATION })).rejects.toMatchObject({
      code: 'unsupported_platform',
    });
    expect(mocks.request).not.toHaveBeenCalled();
  });

  describe('on Android', () => {
    beforeEach(() => {
      mocks.platformOS = 'android';
      mocks.launcher = 'android';
    });

    test('opens the transfer with a VIEW intent that names the app as referrer', async () => {
      const { openExternalBrowser } = useNativeToWeb();

      await openExternalBrowser({ destination: DESTINATION });

      expect(mocks.startActivityAsync).toHaveBeenCalledTimes(1);
      expect(mocks.startActivityAsync).toHaveBeenCalledWith('android.intent.action.VIEW', {
        data: TRANSFER_URL,
        extra: { 'android.intent.extra.REFERRER_NAME': 'android-app://com.example.app' },
      });
      expect(mocks.openURL).not.toHaveBeenCalled();
    });

    test('fails with missing_dependency before minting when expo-intent-launcher is missing', async () => {
      mocks.intentLauncherInstalled = false;
      const { openExternalBrowser } = useNativeToWeb();

      const error = await openExternalBrowser({ destination: DESTINATION }).then(
        () => null,
        (e: unknown) => e,
      );

      expect(error).toMatchObject({ code: 'missing_dependency' });
      expect(String(error)).toContain('npx expo install expo-intent-launcher');
      expect(mocks.request).not.toHaveBeenCalled();
    });

    test('shares one mint and one intent between overlapping calls', async () => {
      const { openExternalBrowser } = useNativeToWeb();

      await Promise.all([
        openExternalBrowser({ destination: DESTINATION }),
        openExternalBrowser({ destination: DESTINATION }),
      ]);

      expect(mocks.request).toHaveBeenCalledTimes(1);
      expect(mocks.startActivityAsync).toHaveBeenCalledTimes(1);
    });
  });
});
