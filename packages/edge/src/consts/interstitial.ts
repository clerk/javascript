import { LIB_NAME, LIB_VERSION } from "../info";

const packageName = LIB_NAME;
const packageVersion = LIB_VERSION;
const packageRepo = "https://github.com/clerkinc/clerk-sdk-edge";
const SERVER_API_URL = "https://api.clerk.dev";
const apiVersion = "v1";
const path = "/internal/interstitial";
export const SDK_USER_AGENT = `${packageName}/${packageVersion} (${packageRepo})`;
export const INTERSTITIAL_METHOD = "GET";
export const INTERSTITIAL_URL = `${SERVER_API_URL}/${apiVersion}${path}`;
