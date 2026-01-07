import type { PropsWithChildren } from 'react';
import React from 'react';
/**
 * @internal
 */
export function SWRConfigCompat({ children }: PropsWithChildren<{ swrConfig?: unknown }>) {
  return <>{children}</>;
}
