import React from 'react';

import type { PortalContainer } from '../primitives/portal';
import type { ModalHandle, ModalSurface } from './modal.types';

export function useModal<Options>(surface: ModalSurface<Options>): ModalHandle<Options> {
  const controller = React.useContext(surface.context);
  if (!controller) {
    throw new Error(`[clerk] The "${surface.id}" modal must be used within a <MosaicProvider> that renders it.`);
  }

  const isOpen = React.useSyncExternalStore(controller.subscribe, () => controller.getState().open, closedSnapshot);

  return React.useMemo(() => {
    const preload = () => surface.loader.send({ type: 'LOAD' });
    return {
      open: (options?: Options, container?: PortalContainer) => {
        preload();
        controller.open(options, container);
      },
      close: controller.close,
      preload,
      isOpen,
    };
  }, [surface, controller, isOpen]);
}

function closedSnapshot() {
  return false;
}
