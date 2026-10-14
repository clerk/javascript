import { AppState, Platform } from 'react-native';

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function isNative(): boolean {
  return !isWeb();
}

function isAppInBackgroundOrInactive(): boolean {
  return AppState.currentState === 'background' || AppState.currentState === 'inactive';
}

function getAbortReason(signal?: AbortSignal): Error {
  if (signal?.reason instanceof Error) {
    return signal.reason;
  }
  const abortError = new Error('The operation was aborted.');
  abortError.name = 'AbortError';
  return abortError;
}

export function waitUntilAppIsActive(signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(getAbortReason(signal));
  }
  if (!isAppInBackgroundOrInactive()) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      subscription.remove();
      reject(getAbortReason(signal));
    };
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        subscription.remove();
        signal?.removeEventListener('abort', handleAbort);
        resolve();
      }
    });
    signal?.addEventListener('abort', handleAbort, { once: true });
  });
}

export function isHermes() {
  //@ts-expect-error HermesInternal is added only added by the Hermes JS Engine
  return !!global.HermesInternal;
}

export function reactNativeVersion() {
  return Platform.constants.reactNativeVersion;
}
