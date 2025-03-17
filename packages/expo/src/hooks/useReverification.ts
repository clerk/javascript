import { useReverification as useReverificationShared } from '@clerk/shared/react';
import { isNative } from 'src/utils';

import { errorThrower } from '../errorThrower';

/**
 * The `useReverification` hook options
 *
 * @interface
 */
type UseReverificationOptions = {
  /**
   * This option is only available in web environments. If `true`, the default Clerk UI will be used.
   * If this option is set to `true` in a native environment, an error will be thrown.
   *
   * @default false
   */
  defaultUI?: boolean;
  /**
   * If `true`, the action will throw an error if it fails or is cancelled.
   *
   * @default true
   */
  throwOnError?: boolean;
};

export const useReverification = <
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions,
>(
  fetcher: Fetcher,
  options: Options,
): ReturnType<typeof useReverificationShared<Fetcher, Options>> => {
  if (isNative() && options?.defaultUI) {
    errorThrower.throw('Reverification component is not supported in native environments.');
  }

  return useReverificationShared<Fetcher, Options>(fetcher, {
    defaultUI: false,
    ...options,
  });
};
