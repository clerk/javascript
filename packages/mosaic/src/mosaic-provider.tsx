import React from 'react';

import { ToastProvider } from './components/toast/toast';
import { userProfileModal } from './features/user-profile/user-profile.modal';
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
}

// Exported Mosaic components annotate a React return type on purpose. The package sets
// `jsxImportSource: '@emotion/react'`, so an inferred return leaks Emotion's `JSX.Element` into the
// published `.d.ts`, which React 19 consumers reject as a JSX element type.
export function MosaicProvider({ children, direction, icons, localization }: MosaicProviderProps): React.ReactElement {
  const iconsValue = React.useMemo(() => icons ?? {}, [icons]);
  const localizationValue = React.useMemo(() => resolveLocalization(localization), [localization]);
  const [now] = React.useState(() => new Date());

  return (
    <DirectionProvider direction={direction}>
      <MosaicIconsProvider value={iconsValue}>
        <MosaicLocalizationProvider value={localizationValue}>
          <MosaicNowProvider value={now}>
            <ToastProvider>
              <ModalHost surfaces={modalSurfaces}>{children}</ModalHost>
            </ToastProvider>
          </MosaicNowProvider>
        </MosaicLocalizationProvider>
      </MosaicIconsProvider>
    </DirectionProvider>
  );
}

const modalSurfaces: ModalSurfaces = [userProfileModal];
