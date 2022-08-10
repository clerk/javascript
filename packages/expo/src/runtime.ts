export function isReactNative(): boolean {
  return typeof navigator != 'undefined' && navigator.product === 'ReactNative';
}
