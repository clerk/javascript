'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useMenuContext } from './menu-context';

export type MenuPositionerProps = ComponentProps<'div'>;

export const MenuPositioner = React.forwardRef<HTMLDivElement, MenuPositionerProps>(
  function MenuPositioner(props, ref) {
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
      isNested,
      setActiveIndex,
    } = useMenuContext();

    const side = placement.split('-')[0];

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
              const item = items[i];
              if (item != null && !item.hasAttribute('aria-disabled')) {
                setActiveIndex(i);
                break;
              }
            }
          }
        }
      },
    });

    const ownProps = {
      'data-cl-slot': 'menu-positioner',
      'data-cl-side': side,
      style: floatingStyles,
    } satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...floatingProps };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The menu id is owned by floating-ui's menu role: a consumer-supplied id must
    // not override it, or the trigger's aria-controls pairing would silently break.
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
        initialFocus={isNested ? -1 : 0}
        returnFocus={!isNested}
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
