'use client';

import { FloatingFocusManager, FloatingList, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useSelectContext } from './select-context';

export type SelectPositionerProps = ComponentProps<'div'>;

export function SelectPositioner(props: SelectPositionerProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const {
    mounted,
    floatingContext,
    refs,
    floatingStyles,
    placement,
    getFloatingProps,
    elementsRef,
    labelsRef,
    setActiveIndex,
  } = useSelectContext();

  const side = placement.split('-')[0];

  // floating-ui types `setFloating` as a method signature, but at runtime it's
  // a stable callback that doesn't use `this`, so the unbound-method check is a
  // false positive here.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const combinedRef = useMergeRefs([refs.setFloating, consumerRef]);

  const floatingProps = getFloatingProps({
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const items = elementsRef.current;
        if (event.key === 'Home') {
          const firstEnabled = items.findIndex(el => el != null && !el.hasAttribute('aria-disabled'));
          if (firstEnabled !== -1) {
            setActiveIndex(firstEnabled);
          }
        } else {
          for (let i = items.length - 1; i >= 0; i--) {
            const el = items[i];
            if (el != null && !el.hasAttribute('aria-disabled')) {
              setActiveIndex(i);
              break;
            }
          }
        }
      }
    },
  }) as React.ComponentPropsWithRef<'div'>;

  const defaultProps = {
    'data-cl-slot': 'select-positioner',
    'data-cl-side': side,
    ref: combinedRef,
    style: floatingStyles,
    ...floatingProps,
  };

  const merged = mergeProps<'div'>(defaultProps, otherProps);
  // The listbox id is owned by floating-ui's listbox role: a consumer-supplied
  // id must not override it, or the trigger's aria-controls pairing would
  // silently break.
  if (floatingProps.id != null) {
    merged.id = floatingProps.id;
  }

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={false}
    >
      <FloatingList
        elementsRef={elementsRef}
        labelsRef={labelsRef}
      >
        {renderElement({
          defaultTagName: 'div',
          render,
          enabled: mounted,
          props: merged,
        })}
      </FloatingList>
    </FloatingFocusManager>
  );
}
