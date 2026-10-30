import React from 'react';

import { ToastProvider } from './components/toast/toast';
import { organizationProfileModal } from './features/organization-profile/organization-profile.modal';
import type { MosaicProfile } from './features/profile-pages/use-mosaic-profile';
import { MosaicProfileProvider } from './features/profile-pages/use-mosaic-profile';
import { userProfileModal } from './features/user-profile/user-profile.modal';
import { UserProfileModalReturn } from './features/user-profile/user-profile.modal-return';
import type { MosaicExperimental } from './hooks/use-mosaic-experimental';
import { MosaicExperimentalProvider } from './hooks/use-mosaic-experimental';
import { MosaicNowProvider } from './hooks/use-now';
import type { MosaicIconOverrides } from './icons/overrides';
import { MosaicIconsProvider } from './icons/overrides';
import type { MosaicLocalization } from './localization';
import { MosaicLocalizationProvider, resolveLocalization } from './localization';
import type { ModalSurfaces } from './modals/modal.types';
import { ModalHost } from './modals/modal-host';
import type { TextDirection } from './primitives/direction-provider';
import { DirectionProvider } from './primitives/direction-provider';

export interface MosaicProviderProps {
  children: React.ReactNode;
  /** Reading direction that arrow-key navigation follows. Set it to match the page's `dir`. Defaults to `ltr`. */
  direction?: TextDirection;
  /** Per-name icon glyph overrides, applied to every `<Icon>` below this provider. */
  icons?: MosaicIconOverrides;
  /** Locale and strings for everything Mosaic renders; see `MosaicLocalization`. */
  localization?: MosaicLocalization;
  /** Features still being tried out. Their names and behavior can change in any release. */
  experimental?: MosaicExperimental;
  /** The profile `UserButton`, `OrganizationSwitcher` and `UserProfile` share: its shape, and the options it takes. */
  profile?: MosaicProfile;
}

// Exported Mosaic components annotate a React return type on purpose. The package sets
// `jsxImportSource: '@emotion/react'`, so an inferred return leaks Emotion's `JSX.Element` into the
// published `.d.ts`, which React 19 consumers reject as a JSX element type.
export function MosaicProvider({
  children,
  direction,
  icons,
  localization,
  experimental,
  profile = defaultProfile,
}: MosaicProviderProps): React.ReactElement {
  const iconsValue = React.useMemo(() => icons ?? {}, [icons]);
  const localizationValue = React.useMemo(() => resolveLocalization(localization), [localization]);
  const [now] = React.useState(() => new Date());
  const newProfiles = experimental?.newProfiles;
  const experimentalValue = React.useMemo(() => ({ newProfiles }), [newProfiles]);

  return (
    <DirectionProvider direction={direction}>
      <MosaicIconsProvider value={iconsValue}>
        <MosaicLocalizationProvider value={localizationValue}>
          <MosaicNowProvider value={now}>
            <MosaicExperimentalProvider value={experimentalValue}>
              <MosaicProfileProvider value={profile}>
                <ToastProvider>
                  <ModalHost surfaces={modalSurfaces}>
                    <UserProfileModalReturn />
                    {children}
                  </ModalHost>
                </ToastProvider>
              </MosaicProfileProvider>
            </MosaicExperimentalProvider>
          </MosaicNowProvider>
        </MosaicLocalizationProvider>
      </MosaicIconsProvider>
    </DirectionProvider>
  );
}

const defaultProfile: MosaicProfile = {};
const modalSurfaces: ModalSurfaces = [userProfileModal, organizationProfileModal];
