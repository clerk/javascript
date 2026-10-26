import { AppState, type NativeEventSubscription } from 'react-native';

import {
  applyFetchedEnvironment,
  applySupportedAppVersion,
  applyUnsupportedAppVersion,
  getAppVersionSupportStatus,
  isRecord,
  nextAppVersionRequest,
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

type AppVersionRequestHooks = {
  refreshOnForegroundWhileUnsupported: (refresh: () => Promise<unknown>) => void;
  beforeRequest: (requestInit: AppVersionRequest) => void;
  afterResponse: (requestInit: AppVersionRequest, response: AppVersionResponse) => void;
};

let foregroundSubscription: NativeEventSubscription | null = null;

export function createAppVersionRequestHooks(): AppVersionRequestHooks {
  resetAppVersionSupport();
  foregroundSubscription?.remove();
  foregroundSubscription = null;
  const requests = new WeakMap<AppVersionRequest, number>();

  return {
    refreshOnForegroundWhileUnsupported(refresh: () => Promise<unknown>) {
      foregroundSubscription = AppState.addEventListener('change', state => {
        if (state === 'active' && !getAppVersionSupportStatus().isSupported) {
          void refresh().catch(() => {});
        }
      });
    },
    beforeRequest(requestInit: AppVersionRequest) {
      requests.set(requestInit, nextAppVersionRequest());
      setNativeAppIdentityHeaders(requestInit.headers as Headers);
    },
    afterResponse(requestInit: AppVersionRequest, response: AppVersionResponse) {
      const request = requests.get(requestInit);
      if (request === undefined) {
        return;
      }
      const unsupportedAppVersionError =
        response.status === 403 ? findUnsupportedAppVersionError(response.payload) : null;
      if (unsupportedAppVersionError) {
        applyUnsupportedAppVersion(unsupportedAppVersionError.meta, request);
        return;
      }
      if (response.headers.get(APP_VERSION_STATUS_HEADER)?.toLowerCase() === 'supported') {
        applySupportedAppVersion(request);
      }
      if (response.ok && requestInit.path === ENVIRONMENT_PATH) {
        applyFetchedEnvironment(environmentJSON(response.payload), request);
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
