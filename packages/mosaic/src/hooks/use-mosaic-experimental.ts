import { createContext, useContext } from 'react';

export interface MosaicExperimental {
  /**
   * Opens Mosaic's own `UserProfile` and `OrganizationProfile` from `UserButton` and
   * `OrganizationSwitcher`, instead of Clerk's profile modals.
   *
   * @default false
   */
  newProfiles?: boolean;
  /** Lets a browser agent read and act on Mosaic's components through WebMCP. */
  webmcp?: boolean;
}

const MosaicExperimentalContext = createContext<MosaicExperimental>({});

export const MosaicExperimentalProvider = MosaicExperimentalContext.Provider;

export function useMosaicExperimental(): MosaicExperimental {
  return useContext(MosaicExperimentalContext);
}
