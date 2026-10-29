import { createContext, useContext } from 'react';

export interface MosaicExperimental {
  /**
   * Opens Mosaic's own `UserProfile` and `OrganizationProfile` from `UserButton` and
   * `OrganizationSwitcher`, instead of Clerk's profile modals. They skip `appearance` and the link
   * entries of `customPages`.
   *
   * @default false
   */
  newProfiles?: boolean;
}

const MosaicExperimentalContext = createContext<MosaicExperimental>({});

export const MosaicExperimentalProvider = MosaicExperimentalContext.Provider;

export function useMosaicExperimental(): MosaicExperimental {
  return useContext(MosaicExperimentalContext);
}
