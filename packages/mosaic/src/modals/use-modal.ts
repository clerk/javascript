import React from 'react';

import type { ModalHandle, ModalSurface } from './modal.types';

export function useModal<Options>(surface: ModalSurface<Options>): ModalHandle<Options> {
  const modal = React.useContext(surface.context);
  if (!modal) {
    throw new Error(`[clerk] The "${surface.id}" modal must be used within a <MosaicProvider> that renders it.`);
  }
  return modal;
}
