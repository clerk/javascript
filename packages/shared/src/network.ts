import { isBrowserOnline, isValidBrowserOnline } from './browser';

type NativeNetworkEnvironment = { isOnline: () => boolean; isActive?: () => boolean };

let nativeNetwork: NativeNetworkEnvironment | undefined;

/** Internal mobile host integration. Unknown connectivity should attempt HTTP. */
export function setNativeNetworkEnvironment(environment: NativeNetworkEnvironment): () => void {
  nativeNetwork = environment;
  return () => {
    if (nativeNetwork === environment) nativeNetwork = undefined;
  };
}

export function isNetworkOnline(): boolean {
  return nativeNetwork ? nativeNetwork.isOnline() : isBrowserOnline();
}

export function isValidNetworkEnvironment(): boolean {
  return nativeNetwork ? nativeNetwork.isOnline() : isValidBrowserOnline();
}

/** Undefined preserves browser and non-mobile behavior. */
export function isNativeApplicationActive(): boolean | undefined {
  return nativeNetwork?.isActive?.();
}
