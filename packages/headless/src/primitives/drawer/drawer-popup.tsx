'use client';

import { FloatingFocusManager, useMergeRefs } from '@floating-ui/react';
import React, { useEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { DrawerAttrs, DrawerCssVars } from './css-vars';
import { useDrawerContext } from './drawer-context';

/** Props for {@link DrawerPopup}. */
export type DrawerPopupProps = ComponentProps<'div'>;

/**
 * The drawer sheet (`role="dialog"`). Hosts the drag gesture, focus trapping
 * (`FloatingFocusManager`), and ARIA wiring. Unless `Drawer.Root` sets
 * `autoFocus`, focus moves to the sheet container rather than its first field, so
 * opening on touch does not summon the keyboard.
 */
export const DrawerPopup = React.forwardRef<HTMLDivElement, DrawerPopupProps>(function DrawerPopup(props, ref) {
  const { render, ...otherProps } = props;
  const {
    popupRef,
    refs,
    getFloatingProps,
    floatingContext,
    modal,
    labelId,
    descriptionId,
    mounted,
    transitionProps,
    drag,
    autoFocus,
    snapPoints,
    activeSnapPointIndex,
    snapRestOffset,
    isNested,
    nestedOpenCount,
  } = useDrawerContext();

  // floating-ui types `setFloating` as a method signature, but at runtime it's
  // a stable callback that doesn't use `this`, so the unbound-method check is a
  // false positive here.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const combinedRef = useMergeRefs([popupRef, refs.setFloating, ref]);

  // The nested-child count is a raw CSS input for the styled stack math. Written
  // imperatively (a `--*` custom property) rather than via React inline style.
  useEffect(() => {
    popupRef.current?.style.setProperty(DrawerCssVars.nestedCount, String(nestedOpenCount));
  }, [popupRef, nestedOpenCount]);

  // Apply the resting snap-point offset here (the popup owns the ref and is
  // mounted), covering initial open and controlled `activeSnapPoint` changes.
  useEffect(() => {
    if (snapRestOffset === null) {
      return;
    }
    popupRef.current?.style.setProperty(DrawerCssVars.snapOffset, `${snapRestOffset}px`);
  }, [popupRef, snapRestOffset]);

  if (!mounted) {
    return null;
  }

  const ownProps = {
    ref: combinedRef,
    tabIndex: -1,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
    style: { touchAction: 'none' as const },
    // Always attached; `handleOnly` is enforced inside the engine's pointer-down gate.
    onPointerDown: drag.onPointerDown,
    onPointerMove: drag.onPointerMove,
    onPointerUp: drag.onPointerUp,
    onPointerCancel: drag.onPointerCancel,
  } satisfies DefaultProps<'div'>;

  const withFloating = mergeProps<'div'>(ownProps, getFloatingProps());
  const defaultProps = mergeProps<'div'>(withFloating, transitionProps);

  const state = {
    swiping: drag.isDragging,
    snap: snapPoints ? activeSnapPointIndex : null,
    expanded: snapPoints ? activeSnapPointIndex === snapPoints.length - 1 : false,
    nested: isNested,
    nestedOpen: nestedOpenCount > 0,
  };

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
      outsideElementsInert={modal}
      initialFocus={autoFocus ? undefined : popupRef}
    >
      {renderElement({
        defaultTagName: 'div',
        render,
        state,
        stateAttributesMapping: {
          swiping: (v): Record<string, string> | null => (v ? { [DrawerAttrs.swiping]: '' } : null),
          snap: (v): Record<string, string> | null => (v === null ? null : { [DrawerAttrs.snap]: String(v) }),
          expanded: (v): Record<string, string> | null => (v ? { [DrawerAttrs.expanded]: '' } : null),
          nested: (v): Record<string, string> | null => (v ? { [DrawerAttrs.nested]: '' } : null),
          nestedOpen: (v): Record<string, string> | null => (v ? { [DrawerAttrs.nestedOpen]: '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </FloatingFocusManager>
  );
});
