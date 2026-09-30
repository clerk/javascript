import type { ComponentType } from 'react';

import type { DialogVariant } from '../components/dialog/dialog';

export interface ModalContentProps<Config, Payload> {
  config: Config;
  payload: Payload | undefined;
}

export interface ModalSurface<Config, Payload> {
  id: string;
  variant: DialogVariant;
  load: () => Promise<{ default: ComponentType<ModalContentProps<Config, Payload>> }>;
}

export interface ModalHandle<Payload> {
  open: (payload?: Payload) => void;
  close: () => void;
  preload: () => void;
  isOpen: boolean;
}
