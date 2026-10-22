import { AppState, type NativeEventSubscription } from 'react-native';

import {
  applyFetchedEnvironment,
  applySupportedAppVersion,
  applyUnsupportedAppVersion,
  getAppVersionSupportGeneration,
  getAppVersionSupportStatus,
  isRecord,
  resetAppVersionSupport,
} from './appVersionSupport';
import { setNativeAppIdentityHeaders } from './nativeAppIdentity';

const UNSUPPORTED_APP_VERSION_CODE = 'unsupported_app_version';
const APP_VERSION_STATUS_HEADER = 'x-clerk-app-version-status';
const ENVIRONMENT_PATH = '/environment';

type AppVersionRequest = {
  path?: string;
  headers?: HeadersInit;
};

type AppVersionResponse = {
  ok: boolean;
  status: number;
  headers: Headers;
  payload: unknown;
};

let foregroundSubscription: NativeEventSubscription | null = null;

export function createAppVersionRequestHooks() {
  resetAppVersionSupport();
  foregroundSubscription?.remove();
  foregroundSubscription = null;
  const generation = getAppVersionSupportGeneration();

  return {
    refreshOnForegroundWhileUnsupported(refresh: () => Promise<unknown>) {
      foregroundSubscription = AppState.addEventListener('change', state => {
        if (state === 'active' && !getAppVersionSupportStatus().isSupported) {
          void refresh().catch(() => {});
        }
      });
    },
    beforeRequest(requestInit: AppVersionRequest) {
      setNativeAppIdentityHeaders(requestInit.headers as Headers);
    },
    afterResponse(requestInit: AppVersionRequest, response: AppVersionResponse) {
      const unsupportedAppVersionError =
        response.status === 403 ? findUnsupportedAppVersionError(response.payload) : null;
      if (unsupportedAppVersionError) {
        applyUnsupportedAppVersion(unsupportedAppVersionError.meta, generation);
        return;
      }
      if (response.headers.get(APP_VERSION_STATUS_HEADER)?.toLowerCase() === 'supported') {
        applySupportedAppVersion(generation);
      }
      if (response.ok && requestInit.path === ENVIRONMENT_PATH) {
        applyFetchedEnvironment(environmentJSON(response.payload), generation);
      }
    },
  };
}

function findUnsupportedAppVersionError(payload: unknown): { meta?: unknown } | null {
  const errors = isRecord(payload) && Array.isArray(payload.errors) ? payload.errors : [];
  return errors.find(error => isRecord(error) && error.code === UNSUPPORTED_APP_VERSION_CODE) ?? null;
}

function environmentJSON(payload: unknown): unknown {
  return isRecord(payload) && isRecord(payload.response) ? payload.response : payload;
}
