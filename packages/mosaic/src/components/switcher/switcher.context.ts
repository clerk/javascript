import React from 'react';

/** Which component the parts belong to. It prefixes every part's `.cl-*` class, such as `cl-user-button-item`. */
export type SwitcherSurface = 'switcher' | 'user-button' | 'organization-switcher';

const SurfaceContext = React.createContext<SwitcherSurface>('switcher');

export const SwitcherSurfaceProvider = SurfaceContext.Provider;

export function useSwitcherSurface(): SwitcherSurface {
  return React.useContext(SurfaceContext);
}

export function useSlot(): (part: string) => string {
  const surface = useSwitcherSurface();
  return part => `${surface}-${part}`;
}

const RootContext = React.createContext(false);

export const SwitcherRootProvider = RootContext.Provider;

/** Whether a part renders inside a `Switcher.Root`. Outside one, `Switcher.Trigger` renders a plain button. */
export function useInSwitcherRoot(): boolean {
  return React.useContext(RootContext);
}
