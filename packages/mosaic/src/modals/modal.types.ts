import type { ComponentType } from 'react';

import type { DialogVariant } from '../components/dialog/dialog';

export interface ModalContentProps<Options> {
  options: Options;
  close: () => void;
}

export interface ModalSurface<Options> {
  id: string;
  variant: DialogVariant;
  load: () => Promise<{ default: ComponentType<ModalContentProps<Options>> }>;
}

export interface ModalHandle<Options> {
  open: (options?: Options) => void;
  close: () => void;
  preload: () => void;
  isOpen: boolean;
}
