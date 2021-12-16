import { LIB_NAME, LIB_VERSION } from '../info';

export const PACKAGE_REPO = 'https://github.com/clerkinc/clerk-sdk-edge';
const SERVER_API_URL = 'https://api.clerk.dev';
const apiVersion = 'v1';
export const INTERSTITIAL_METHOD = 'GET';
const INTERSTITIAL_path = '/internal/interstitial';
export const INTERSTITIAL_URL = `${SERVER_API_URL}/${apiVersion}${INTERSTITIAL_path}`;
export const SDK_USER_AGENT = `${LIB_NAME}/${LIB_VERSION} (${PACKAGE_REPO})`;
