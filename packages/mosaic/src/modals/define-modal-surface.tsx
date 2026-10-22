import React from 'react';

import type { ModalSurface, ModalSurfaceConfig } from './modal.types';
import { createModalContentLoader } from './modal-content-loader';
import type { ModalController } from './modal-controller';
import { ModalSurfaceHost } from './modal-host';

export function defineModalSurface<Options>(config: ModalSurfaceConfig<Options>): ModalSurface<Options> {
  const surface: ModalSurface<Options> = {
    ...config,
    loader: createModalContentLoader(config.load),
    context: React.createContext<ModalController<Options> | null>(null),
    Host: function MosaicModalSurfaceHost({ children }) {
      return <ModalSurfaceHost surface={surface}>{children}</ModalSurfaceHost>;
    },
  };
  return surface;
}
