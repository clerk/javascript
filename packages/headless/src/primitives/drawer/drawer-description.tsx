'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
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
    } satisfies DefaultProps<'p'>;

    return useRender({
      defaultTagName: 'p',
      render,
      ref,
      props: mergeProps<'p'>(defaultProps, otherProps),
    });
  },
);
