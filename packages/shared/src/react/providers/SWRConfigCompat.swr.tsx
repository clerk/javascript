import React, { type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

/**
 * @internal
 */
export function SWRConfigCompat({ swrConfig, children }: PropsWithChildren<{ swrConfig?: any }>) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
