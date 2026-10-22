import type { ComponentType, Context, ReactNode } from 'react';

import type { DialogVariant } from '../components/dialog/dialog';
import type { PortalContainer } from '../primitives/portal';
import type { ModalContentLoader } from './modal-content-loader';
import type { ModalController } from './modal-controller';

export interface ModalContentProps<Options> {
  options: Options | undefined;
  close: () => void;
}

export interface ModalSurfaceConfig<Options> {
  id: string;
  variant: DialogVariant;
  load: () => Promise<{ default: ComponentType<ModalContentProps<Options>> }>;
}

export interface ModalHostSurface {
  id: string;
  Host: ComponentType<{ children: ReactNode }>;
}

export type ModalSurfaces = ReadonlyArray<ModalHostSurface>;

export interface ModalSurface<Options> extends ModalSurfaceConfig<Options>, ModalHostSurface {
  loader: ModalContentLoader<Options>;
  context: Context<ModalController<Options> | null>;
}

export interface ModalHandle<Options> {
  open: (options?: Options, container?: PortalContainer) => void;
  close: () => void;
  preload: () => void;
  isOpen: boolean;
}
