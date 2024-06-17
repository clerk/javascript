import { decode, encode } from 'base-64';

//@ts-expect-error HermesInternal is added by the Hermes JS Engine
const isHermes = !!global.HermesInternal;

// See Default Expo 51 engine Hermes' issue: https://github.com/facebook/hermes/issues/1379
if (!global.btoa || isHermes) {
  global.btoa = encode;
}

// See Default Expo 51 engine Hermes' issue: https://github.com/facebook/hermes/issues/1379
if (!global.atob || isHermes) {
  global.atob = decode;
}
