'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useSelectContext } from './select-context';

export type SelectPositionerProps = ComponentProps<'div'>;

export const SelectPositioner = React.forwardRef<HTMLDivElement, SelectPositionerProps>(
  function SelectPositioner(props, ref) {
    const { render, ...otherProps } = props;
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

    const floatingProps = getFloatingProps({
      onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const items = elementsRef.current;
          if (event.key === 'Home') {
            const firstEnabled = items.findIndex(el => el != null && el.getAttribute('aria-disabled') !== 'true');
            if (firstEnabled !== -1) {
              setActiveIndex(firstEnabled);
            }
          } else {
            for (let i = items.length - 1; i >= 0; i--) {
              const el = items[i];
              if (el != null && el.getAttribute('aria-disabled') !== 'true') {
                setActiveIndex(i);
                break;
              }
            }
          }
        }
      },
    });

    const ownProps = {
      'data-side': side,
      style: floatingStyles,
    } satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...floatingProps };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The listbox id is owned by floating-ui's listbox role: a consumer-supplied
    // id must not override it, or the trigger's aria-controls pairing would
    // silently break.
    if (floatingProps.id != null) {
      merged.id = floatingProps.id;
    }

    const element = useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      // floating-ui types `setFloating` as a method signature, but at runtime it's
      // a stable callback that doesn't use `this`, so the unbound-method check is a
      // false positive here.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: [refs.setFloating, ref],
      props: merged,
    });

    if (!element) {
      return null;
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
          {element}
        </FloatingList>
      </FloatingFocusManager>
    );
  },
);
