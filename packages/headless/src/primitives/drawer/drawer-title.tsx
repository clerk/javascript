'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDrawerContext } from './drawer-context';

/** Props for {@link DrawerTitle}. */
export type DrawerTitleProps = Omit<ComponentProps<'h2'>, 'id'>;

/** Accessible drawer heading. Wires its `id` to `aria-labelledby` on `Drawer.Popup`. */
export const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(function DrawerTitle(props, ref) {
  const { render, ...otherProps } = props;
  const { labelId } = useDrawerContext();

  const defaultProps = {
    id: labelId,
    ref,
  } satisfies DefaultProps<'h2'>;

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
});
