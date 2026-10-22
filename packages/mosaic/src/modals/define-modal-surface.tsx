import React from 'react';

import type { ModalHandle, ModalSurface, ModalSurfaceConfig } from './modal.types';
import { createModalContentLoader } from './modal-content-loader';
import { ModalSurfaceHost } from './modal-host';

export function defineModalSurface<Options>(config: ModalSurfaceConfig<Options>): ModalSurface<Options> {
  const surface: ModalSurface<Options> = {
    ...config,
    loader: createModalContentLoader(config.load),
    context: React.createContext<ModalHandle<Options> | null>(null),
    Host: function MosaicModalSurfaceHost({ children }) {
      return <ModalSurfaceHost surface={surface}>{children}</ModalSurfaceHost>;
    },
  };
  return surface;
}
