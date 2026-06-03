'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useSelectContext } from './select-context';

export interface SelectPositionerProps extends ComponentProps<'div'> {}

export function SelectPositioner(props: SelectPositionerProps) {
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

  const defaultProps = {
    'data-cl-slot': 'select-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    ...(getFloatingProps({
      onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const items = elementsRef.current;
          if (event.key === 'Home') {
            const firstEnabled = items.findIndex(el => el != null && !el.hasAttribute('aria-disabled'));
            if (firstEnabled !== -1) setActiveIndex(firstEnabled);
          } else {
            for (let i = items.length - 1; i >= 0; i--) {
              if (items[i] != null && !items[i]!.hasAttribute('aria-disabled')) {
                setActiveIndex(i);
                break;
              }
            }
          }
        }
      },
    }) as React.ComponentPropsWithRef<'div'>),
  };

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
          props: mergeProps<'div'>(defaultProps, otherProps),
        })}
      </FloatingList>
    </FloatingFocusManager>
  );
}
