import type { ComponentType, Context, ReactNode } from 'react';

import type { DialogVariant } from '../components/dialog/dialog';
import type { PortalContainer } from '../primitives/portal';
import type { SegmentParts } from '../routing/location';
import type { ModalContentLoader } from './modal-content-loader';

export interface ModalContentProps<Options> {
  options: Options | undefined;
  close: () => void;
  path: string;
}

export interface ModalSurfaceConfig<Options> {
  id: string;
  variant: DialogVariant;
  load: () => Promise<{ default: ComponentType<ModalContentProps<Options>> }>;
  // The base of the entry that keeps the modal open, `/modal/<id>` by default
  path?: string;
  // The parts written on open, derived from the open options; an empty entry by default.
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
