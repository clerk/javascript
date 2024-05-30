import { Platform } from 'react-native';

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function isNative(): boolean {
  return !isWeb();
}

export function isHermes() {
  //@ts-expect-error HermesInternal is added only added by the Hermes JS Engine
  return !!global.HermesInternal;
}

export function reactNativeVersion() {
  return Platform.constants.reactNativeVersion;
}
