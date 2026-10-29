import type { ComponentType, Context, ReactNode } from 'react';

import type { DialogVariant } from '../components/dialog/dialog';
import type { PortalContainer } from '../primitives/portal';
import type { ModalContentLoader } from './modal-content-loader';

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
  context: Context<ModalHandle<Options> | null>;
}

export interface ModalHandle<Options> {
  open: (options?: Options, container?: PortalContainer, opener?: string) => void;
  close: () => void;
  preload: () => void;
  isOpen: boolean;
  registerOpener: (opener: ModalOpener<Options>) => () => void;
}

export interface ModalOpener<Options> {
  id: string;
  options: () => Options;
}
