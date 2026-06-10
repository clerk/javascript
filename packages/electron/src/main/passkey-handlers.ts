import type { IpcMainInvokeEvent } from 'electron';
import { BrowserWindow, ipcMain } from 'electron';

import { PASSKEY_CHANNELS } from '../shared/ipc';
import type {
  AuthenticationResponseJSON,
  PasskeyCapabilities,
  PasskeyIpcResult,
  PasskeyNativeErrorCode,
  RegistrationResponseJSON,
  SerializedPublicKeyCredentialCreationOptions,
  SerializedPublicKeyCredentialRequestOptions,
  SetupPasskeysMainReturn,
} from '../shared/types';

/**
 * Optional native module. Ceremony failures resolve as JSON envelopes so error
 * codes survive both the FFI and Electron IPC boundaries.
 */
type NativePasskeysModule = {
  isAvailable: () => boolean;
  capabilities: () => Omit<PasskeyCapabilities, 'available'>;
  createCredential: (windowHandle: Buffer, optionsJson: string) => Promise<string>;
  getCredential: (windowHandle: Buffer, optionsJson: string) => Promise<string>;
};

let nativeModulePromise: Promise<NativePasskeysModule> | undefined;

function loadNativeModule(): Promise<NativePasskeysModule> {
  // Keep the native module optional for apps that do not use passkeys.
  nativeModulePromise ??= import('@clerk/electron-passkeys').then(
    (module: { default?: NativePasskeysModule } & NativePasskeysModule) => module.default ?? module,
    error => {
      nativeModulePromise = undefined;
      throw new Error(
        'Clerk: setupPasskeysMain requires the optional @clerk/electron-passkeys package. Install it with your package manager to enable native passkey support.',
        { cause: error },
      );
    },
  );
  return nativeModulePromise;
}

const NATIVE_ERROR_CODES: PasskeyNativeErrorCode[] = ['cancelled', 'invalid_rp', 'not_supported', 'timeout', 'unknown'];

function isPasskeyIpcResult<T>(value: unknown): value is PasskeyIpcResult<T> {
  if (!value || typeof value !== 'object' || typeof (value as { ok?: unknown }).ok !== 'boolean') {
    return false;
  }
  const result = value as { ok: boolean; credential?: unknown; error?: { code?: unknown } };
  return result.ok
    ? result.credential !== undefined
    : NATIVE_ERROR_CODES.includes(result.error?.code as PasskeyNativeErrorCode);
}

async function invokeNative<T>(
  method: 'createCredential' | 'getCredential',
  event: IpcMainInvokeEvent,
  options: SerializedPublicKeyCredentialCreationOptions | SerializedPublicKeyCredentialRequestOptions,
): Promise<PasskeyIpcResult<T>> {
  let native: NativePasskeysModule;
  try {
    native = await loadNativeModule();
  } catch (error) {
    return {
      ok: false,
      error: { code: 'not_supported', message: error instanceof Error ? error.message : String(error) },
    };
  }

  if (!native.isAvailable()) {
    return {
      ok: false,
      error: { code: 'not_supported', message: 'Native passkeys are not supported on this platform.' },
    };
  }

  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    return {
      ok: false,
      error: { code: 'unknown', message: 'The passkey request did not originate from a visible window.' },
    };
  }

  try {
    const resultJson = await native[method](window.getNativeWindowHandle(), JSON.stringify(options));
    const result: unknown = JSON.parse(resultJson);
    if (!isPasskeyIpcResult<T>(result)) {
      return { ok: false, error: { code: 'unknown', message: 'The native module returned an unexpected result.' } };
    }
    return result;
  } catch (error) {
    return { ok: false, error: { code: 'unknown', message: error instanceof Error ? error.message : String(error) } };
  }
}

/** Registers IPC handlers for native platform WebAuthn. */
export function setupPasskeysMain(): SetupPasskeysMainReturn {
  // Surface a missing optional dependency during setup, before the first ceremony.
  loadNativeModule().catch((error: Error) => console.warn(error.message));

  ipcMain.handle(
    PASSKEY_CHANNELS.create,
    (
      event,
      options: SerializedPublicKeyCredentialCreationOptions,
    ): Promise<PasskeyIpcResult<RegistrationResponseJSON>> => invokeNative('createCredential', event, options),
  );

  ipcMain.handle(
    PASSKEY_CHANNELS.get,
    (
      event,
      options: SerializedPublicKeyCredentialRequestOptions,
    ): Promise<PasskeyIpcResult<AuthenticationResponseJSON>> => invokeNative('getCredential', event, options),
  );

  ipcMain.handle(PASSKEY_CHANNELS.capabilities, async (): Promise<PasskeyCapabilities> => {
    try {
      const native = await loadNativeModule();
      if (!native.isAvailable()) {
        return { available: false, platformAuthenticator: false, securityKeys: false };
      }
      return { available: true, ...native.capabilities() };
    } catch {
      return { available: false, platformAuthenticator: false, securityKeys: false };
    }
  });

  return {
    cleanup() {
      ipcMain.removeHandler(PASSKEY_CHANNELS.create);
      ipcMain.removeHandler(PASSKEY_CHANNELS.get);
      ipcMain.removeHandler(PASSKEY_CHANNELS.capabilities);
    },
  };
}
