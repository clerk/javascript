import { isBrowserOnline, isValidBrowserOnline } from './browser';

let nativeNetwork: { isOnline: () => boolean } | undefined;

/** Internal mobile host integration. Unknown connectivity should attempt HTTP. */
export function setNativeNetworkEnvironment(environment: { isOnline: () => boolean }): () => void {
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
