import * as React from 'react';

import type { MosaicLogomark } from '../logomark/logomark';

/** How Mosaic components look. Set them on `MosaicProvider` for every component, or on one component to override the provider key by key. */
export interface MosaicOptions {
  /**
   * The logomark to show in place of the logomark or logo set in the Clerk Dashboard, such as an `<svg>` or a
   * `next/image` `<Image>`. It renders in a 48×48px circle, so use a square logomark. Mosaic sizes,
   * rounds and outlines it by merging a `className` onto this element, so a custom component must
   * accept that prop and spread it onto the element it renders. Pass `false` to hide it.
   */
  logomark?: MosaicLogomark;
}

const MosaicOptionsContext = React.createContext<MosaicOptions>({});

/** Applies `options` to every component below it. Keys it leaves out keep the value from the provider above. */
export function MosaicOptionsProvider({
  options,
  children,
}: {
  options: MosaicOptions | undefined;
  children: React.ReactNode;
}): React.ReactElement {
  const parent = React.useContext(MosaicOptionsContext);
  const logomark = options?.logomark ?? parent.logomark;
  const value = React.useMemo(() => ({ logomark }), [logomark]);
  return <MosaicOptionsContext.Provider value={value}>{children}</MosaicOptionsContext.Provider>;
}

export function useMosaicOptions(): MosaicOptions {
  return React.useContext(MosaicOptionsContext);
}
