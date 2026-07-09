import { decode, encode } from 'base-64';

import { isHermes } from '../utils';

// See Default Expo 51 engine Hermes' issue: https://github.com/facebook/hermes/issues/1379
if (!globalThis.btoa || isHermes()) {
  globalThis.btoa = encode;
}

// See Default Expo 51 engine Hermes' issue: https://github.com/facebook/hermes/issues/1379
if (!globalThis.atob || isHermes()) {
  globalThis.atob = decode;
}
