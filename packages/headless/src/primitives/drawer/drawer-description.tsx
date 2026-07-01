'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDrawerContext } from './drawer-context';

/** Props for {@link DrawerDescription}. */
export type DrawerDescriptionProps = Omit<ComponentProps<'p'>, 'id'>;

/** Accessible drawer description. Wires its `id` to `aria-describedby` on `Drawer.Popup`. */
export const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  function DrawerDescription(props, ref) {
    const { render, ...otherProps } = props;
    const { descriptionId } = useDrawerContext();

    const defaultProps = {
      id: descriptionId,
      ref,
    } satisfies DefaultProps<'p'>;

    return renderElement({
      defaultTagName: 'p',
      render,
      props: mergeProps<'p'>(defaultProps, otherProps),
    });
  },
);
