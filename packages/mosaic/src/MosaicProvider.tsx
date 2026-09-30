import React from 'react';

import { ToastProvider } from './components/toast/toast';
import type { UserProfileModalConfig } from './features/user-profile/user-profile.modal.types';
import type { MosaicIconOverrides } from './icons/overrides';
import { MosaicIconsProvider } from './icons/overrides';
import type { MosaicLocalization } from './localization';
import { MosaicLocalizationProvider, resolveLocalization } from './localization';
import { ModalHost } from './modals/modal-host';

export interface MosaicProviderProps {
  children: React.ReactNode;
  /** Per-name icon glyph overrides, applied to every `<Icon>` below this provider. */
  icons?: MosaicIconOverrides;
  /** Locale and strings for everything Mosaic renders; see `MosaicLocalization`. */
  localization?: MosaicLocalization;
  userProfile?: UserProfileModalConfig;
}

// Exported Mosaic components annotate a React return type on purpose. The package sets
// `jsxImportSource: '@emotion/react'`, so an inferred return leaks Emotion's `JSX.Element` into the
// published `.d.ts`, which React 19 consumers reject as a JSX element type.
export function MosaicProvider({
  children,
  icons,
  localization,
  userProfile,
}: MosaicProviderProps): React.ReactElement {
  const iconsValue = React.useMemo(() => icons ?? {}, [icons]);
  const localizationValue = React.useMemo(() => resolveLocalization(localization), [localization]);
  const modalDefaults = React.useMemo(() => ({ userProfile }), [userProfile]);

  return (
    <MosaicIconsProvider value={iconsValue}>
      <MosaicLocalizationProvider value={localizationValue}>
        <ToastProvider>
          <ModalHost defaults={modalDefaults}>{children}</ModalHost>
        </ToastProvider>
      </MosaicLocalizationProvider>
    </MosaicIconsProvider>
  );
}
