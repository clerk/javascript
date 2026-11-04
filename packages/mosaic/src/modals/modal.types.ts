import type { ComponentType, Context, ReactNode } from 'react';

import type { DialogVariant } from '../components/dialog/dialog';
import type { PortalContainer } from '../primitives/portal';
import type { SegmentParts } from '../routing/location';
import type { ModalContentLoader } from './modal-content-loader';

export interface ModalContentProps<Options> {
  options: Options | undefined;
  close: () => void;
  path: string | undefined;
}

export interface ModalSurfaceConfig<Options> {
  id: string;
  variant: DialogVariant;
  load: () => Promise<{ default: ComponentType<ModalContentProps<Options>> }>;
  // If path is provided, the modal host writes it before opening and clears it on close
  path?: string;
  // Optional way to derive the initial segment to be written together with path on open
  initialParts?: (options: Options | undefined) => SegmentParts;
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
  open: (options?: Options, container?: PortalContainer) => void;
  close: () => void;
  preload: () => void;
  isOpen: boolean;
}
