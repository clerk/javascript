import type { ComponentType } from 'react';

import type { DialogVariant } from '../components/dialog/dialog';
import type { PortalContainer } from '../primitives/portal';

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
  open: (options?: Options, container?: PortalContainer) => void;
  close: () => void;
  preload: () => void;
  isOpen: boolean;
}
