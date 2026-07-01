'use client';

import { createContext, type PointerEventHandler, useContext } from 'react';

import type { DialogContextValue } from '../dialog/dialog-context';

/** The pointer handlers + dragging flag produced by `useDrawerDrag`. */
export interface DrawerDrag {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
  isDragging: boolean;
}

/** Callbacks a nested `Drawer.Root` invokes on its parent so the parent can scale/dim back. */
export interface NestedDrawerCallbacks {
  onNestedOpenChange: (open: boolean) => void;
  /** Live 0..1 dismiss progress of the child, reported each pointermove while it drags. */
  onNestedDrag: (progress: number) => void;
  /** The child's drag gesture ended; the parent clears its live coupling and settles. */
  onNestedRelease: () => void;
}

export interface DrawerContextValue extends DialogContextValue {
  backdropRef: React.RefObject<HTMLDivElement | null>;
  drag: DrawerDrag;
  /** When true (default), a downward release past threshold closes the drawer. */
  dismissible: boolean;
  /** When true, only a press starting on `Drawer.Handle` initiates a drag. */
  handleOnly: boolean;
  /** When true, focus moves into the popup on open. Defaults to `false` (unlike Dialog). */
  autoFocus: boolean;
  /** Ascending fractions (0..1) of the viewport the drawer rests at, if snap points are enabled. */
  snapPoints?: number[];
  /** Index into `snapPoints` of the resting snap point. `-1` when no snap points. */
  activeSnapPointIndex: number;
  setActiveSnapPointIndex: (index: number) => void;
  /** Resting `translateY` (px) of the active snap point, or `null` when no snap points. */
  snapRestOffset: number | null;
  /** Callbacks a nested child `Drawer.Root` invokes on this (parent) drawer. */
  onNested: NestedDrawerCallbacks;
  /** True when this drawer is itself nested inside another drawer. */
  isNested: boolean;
  /** How many direct nested child drawers are currently open. */
  nestedOpenCount: number;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawerContext(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error('Drawer compound components must be used within <Drawer.Root>');
  }
  return ctx;
}

/** Reads the parent drawer context without throwing — `null` when not nested. */
export function useParentDrawerContext(): DrawerContextValue | null {
  return useContext(DrawerContext);
}
