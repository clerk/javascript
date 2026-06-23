// Vendored from base-64@1.0.0 — see ../vendor/base-64/README.md for the
// supply-chain rationale (this code becomes global.btoa/global.atob inside
// every Clerk-Expo customer app, which makes it an unusually high-leverage
// upstream dep to leave externalized).
import { decode, encode } from '../vendor/base-64';

import { isHermes } from '../utils';

// See Default Expo 51 engine Hermes' issue: https://github.com/facebook/hermes/issues/1379
if (!globalThis.btoa || isHermes()) {
  globalThis.btoa = encode;
}

// See Default Expo 51 engine Hermes' issue: https://github.com/facebook/hermes/issues/1379
if (!globalThis.atob || isHermes()) {
  globalThis.atob = decode;
}
