/**
 * @internal
 */
export function defineKeepPreviousDataFn(enabled: boolean) {
  if (enabled) {
    return function KeepPreviousDataFn<Data>(previousData: Data): Data {
      return previousData;
    };
  }
  return undefined;
}
