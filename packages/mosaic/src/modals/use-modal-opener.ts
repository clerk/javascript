import React from 'react';

import type { ModalHandle, ModalSurface } from './modal.types';
import { useModal } from './use-modal';

export function useModalOpener<Options>(
  surface: ModalSurface<Options>,
  opener: string,
  options: Options,
): ModalHandle<Options> {
  const modal = useModal(surface);
  const { registerOpener } = modal;
  const latest = React.useRef(options);
  latest.current = options;

  React.useEffect(() => registerOpener({ id: opener, options: () => latest.current }), [registerOpener, opener]);

  return { ...modal, open: (overrides, container) => modal.open(overrides, container, opener) };
}

const ModalOpenedByContext = React.createContext<string | undefined>(undefined);

export const ModalOpenedByProvider = ModalOpenedByContext.Provider;

export function useModalOpenedBy(): string | undefined {
  return React.useContext(ModalOpenedByContext);
}
