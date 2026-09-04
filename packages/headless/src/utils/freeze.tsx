'use client';

import * as React from 'react';

const FreezeContext = React.createContext(false);

export interface FreezeProps {
  /** While `true`, renders the children captured on the last unfrozen render. */
  frozen: boolean;
  children?: React.ReactNode;
}

/**
 * Holds `children` at the element it received on the last unfrozen render. Everything baked
 * into that element — props, conditionals, inline callbacks — is held with it; components inside
 * keep rendering, so a value they read through a hook (context, a store) still moves. Wrap such
 * a read in `useFrozenValue` to hold it too.
 *
 * Use it to stop content from visibly changing under an exit animation — a popover that closes
 * because the thing it was showing changed would otherwise swap its contents on the way out.
 */
export function Freeze({ frozen, children }: FreezeProps) {
  // Render-phase derived state rather than an effect: React re-runs this render before committing,
  // so the DOM never shows a frame the snapshot has not caught up with.
  const [snapshot, setSnapshot] = React.useState(children);
  if (!frozen && snapshot !== children) {
    setSnapshot(children);
  }
  return <FreezeContext.Provider value={frozen}>{frozen ? snapshot : children}</FreezeContext.Provider>;
}

/** `true` while the nearest enclosing `Freeze` is holding — for a popup, while it animates out. */
export function useIsFrozen(): boolean {
  return React.useContext(FreezeContext);
}

/**
 * Returns `value`, except while the nearest enclosing `Freeze` is holding, when it returns the
 * value seen on the last unfrozen render. For content that reads what it shows through a hook
 * rather than receiving it as props.
 */
export function useFrozenValue<T>(value: T): T {
  const frozen = useIsFrozen();
  const [held, setHeld] = React.useState(value);
  if (!frozen && !Object.is(held, value)) {
    setHeld(value);
  }
  return frozen ? held : value;
}
