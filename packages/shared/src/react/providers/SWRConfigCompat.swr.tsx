import React, { type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

/**
 * @internal
 */
export function SWRConfigCompat({ swrConfig, children }: PropsWithChildren<{ swrConfig?: any }>) {
  // TODO: Replace SWRConfig with the react-query equivalent.
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
