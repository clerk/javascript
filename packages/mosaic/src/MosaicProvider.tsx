import React from 'react';

import type { MosaicIconOverrides } from './icons/overrides';
import { MosaicIconsProvider } from './icons/overrides';

export interface MosaicProviderProps {
  children: React.ReactNode;
  /** Per-name icon glyph overrides, applied to every `<Icon>` below this provider. */
  icons?: MosaicIconOverrides;
}

// Exported Mosaic components annotate a React return type on purpose. The package sets
// `jsxImportSource: '@emotion/react'`, so an inferred return leaks Emotion's `JSX.Element` into the
// published `.d.ts`, which React 19 consumers reject as a JSX element type.
export function MosaicProvider({ children, icons }: MosaicProviderProps): React.ReactElement {
  const value = React.useMemo(() => icons ?? {}, [icons]);

  return <MosaicIconsProvider value={value}>{children}</MosaicIconsProvider>;
}
