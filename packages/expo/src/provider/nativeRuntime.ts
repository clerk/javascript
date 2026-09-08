import {
  __internal_createNativeAdapter,
  __internal_installNativeAppAttestHooks,
  __internal_installNativeAppleHooks,
  __internal_installNativeBiometricHooks,
  __internal_installNativePasskeyHooks,
  type Clerk,
  type EmbeddedState,
} from '@clerk/clerk-js';
import { AppState, Platform } from 'react-native';

import { MemoryTokenCache } from '../cache';
import type { TokenCache } from '../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { ClerkExpoModule } from '../utils/native-module';

export interface NativeRuntimeModule {
  configureExternalRuntime(publishableKey: string, runtimeId: string, state: string): Promise<void>;
  publishRuntimeState(runtimeId: string, state: string): Promise<void>;
  completeRuntimeOperation(runtimeId: string, requestId: string, response: string): Promise<void>;
  detachRuntime(runtimeId: string): Promise<void>;
  performRuntimeCapability(runtimeId: string, action: string, payload: string): Promise<string>;
}

export const supportsNativeRuntime = () =>
  Platform.OS === 'ios' && typeof ClerkExpoModule?.configureExternalRuntime === 'function';

export async function connectNativeRuntime(
  clerk: Clerk,
  publishableKey: string,
  tokenCache: TokenCache = MemoryTokenCache,
  isCurrent: () => boolean,
) {
  const native = ClerkExpoModule as NonNullable<typeof ClerkExpoModule> & NativeRuntimeModule;
  const runtimeId = `expo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let ready = false;
  let disposed = false;
  let initialState: EmbeddedState | undefined;
  let applicationSubscription: { remove(): void } | undefined;
  let resolveConfiguration!: () => void;
  let rejectConfiguration!: (error: Error) => void;
  const configuration = new Promise<void>((resolve, reject) => {
    resolveConfiguration = resolve;
    rejectConfiguration = reject;
  });
  void configuration.catch(() => undefined);
  const capability = async (action: string, payload: string) => {
    await configuration;
    if (disposed || !isCurrent()) {
      throw new Error('The native runtime connection has been disposed');
    }
    const envelope = JSON.parse(await native.performRuntimeCapability(runtimeId, action, payload));
    if (envelope.error) {
      throw Object.assign(new Error(envelope.error.message), envelope.error);
    }
    return envelope.result;
  };
  const hooks = {
    createPublicCredentials: (payload: string) => capability('createPublicCredentials', payload),
    getPublicCredentials: (payload: string) => capability('getPublicCredentials', payload),
    startAppleAuthentication: (payload: string) => capability('startAppleAuthentication', payload),
    biometricPresence: (payload: string) => capability('biometricPresence', payload),
    promptBiometrics: (payload: string) => capability('promptBiometrics', payload),
    prepareDeviceAttestation: (payload: string) => capability('prepareDeviceAttestation', payload),
    prepareDeviceAssertion: (payload: string) => capability('prepareDeviceAssertion', payload),
  };
  const restoreHooks = [
    __internal_installNativePasskeyHooks(clerk, hooks),
    __internal_installNativeAppleHooks(clerk, hooks),
    __internal_installNativeBiometricHooks(clerk, hooks),
    __internal_installNativeAppAttestHooks(clerk, hooks),
  ];
  const adapter = __internal_createNativeAdapter(
    clerk,
    {
      protocolVersion: 1,
      generation: runtimeId,
      publishableKey,
      sdkVersion: 'expo',
    },
    {
      getToken: async () => (await tokenCache.getToken(CLERK_CLIENT_JWT_KEY)) || '',
      saveToken: token => tokenCache.saveToken(CLERK_CLIENT_JWT_KEY, token),
      getCachedResources: () => Promise.resolve({ client: null, environment: null }),
      saveCachedResources: () => Promise.resolve(),
      publish: () => undefined,
      commitState: async state => {
        initialState = state;
        if (ready && !disposed && isCurrent()) {
          await native.publishRuntimeState(runtimeId, JSON.stringify(state));
        }
      },
      crypto: {
        randomString: bytes => capability('randomString', JSON.stringify(bytes)),
        codeChallenge: verifier => capability('codeChallenge', JSON.stringify(verifier)),
      },
      storage: request => capability('storage', JSON.stringify(request)),
      biometricCredential: request => capability('biometricCredential', JSON.stringify(request)),
    },
  );
  const subscription = native.addListener?.('clerkRuntimeOperation', (...args: unknown[]) => {
    const request = args[0] as { runtimeId: string; requestId: string; invocation: string };
    if (disposed || request.runtimeId !== runtimeId || !isCurrent()) {
      return;
    }
    void (async () => {
      let response;
      try {
        response = { result: await adapter.invoke(JSON.parse(request.invocation)) };
      } catch (error) {
        const envelope = (error as { envelope?: unknown }).envelope;
        response = { error: envelope || { kind: 'javascript', errors: [], message: String(error) } };
      }
      if (!disposed && isCurrent()) {
        await native.completeRuntimeOperation(runtimeId, request.requestId, JSON.stringify(response));
      }
    })().catch(error => {
      if (__DEV__ && !disposed) {
        console.warn('[ClerkProvider] Native runtime operation failed:', error);
      }
    });
  });
  const dispose = async () => {
    if (disposed) {
      return;
    }
    disposed = true;
    rejectConfiguration(new Error('The native runtime connection has been disposed'));
    applicationSubscription?.remove();
    subscription?.remove();
    restoreHooks.forEach(restore => restore());
    await adapter.dispose();
    await native.detachRuntime(runtimeId);
  };
  try {
    await adapter.load();
    if (!isCurrent() || !initialState) {
      throw new Error('The native runtime configuration was superseded');
    }
    await native.configureExternalRuntime(publishableKey, runtimeId, JSON.stringify(initialState));
    if (!isCurrent()) {
      throw new Error('The native runtime configuration was superseded');
    }
    ready = true;
    resolveConfiguration();
    let foregroundRefresh: Promise<void> | undefined;
    applicationSubscription = AppState.addEventListener('change', state => {
      if (state !== 'active' || disposed || !isCurrent() || foregroundRefresh) {
        return;
      }
      foregroundRefresh = (async () => {
        await clerk.__internal_reloadInitialResources();
        await clerk.session?.getToken();
        await adapter.invoke({ receiver: { kind: 'clerk' }, method: 'initialize' });
      })()
        .catch(error => {
          if (__DEV__ && !disposed) {
            console.warn('[ClerkProvider] Foreground refresh failed:', error);
          }
        })
        .finally(() => {
          foregroundRefresh = undefined;
        });
    });
    await adapter.invoke({ receiver: { kind: 'clerk' }, method: 'initialize' });
    return dispose;
  } catch (error) {
    await dispose();
    throw error;
  }
}
