'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../utils';
import { type TabsDirection, useTabsContext } from './tabs-context';

export type TabsIndicatorProps = ComponentProps<'span'>;

export const TabsIndicator = React.forwardRef<HTMLSpanElement, TabsIndicatorProps>(function TabsIndicator(props, ref) {
  const { render, ...otherProps } = props;
  const { direction } = useTabsContext();

  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    state: { direction },
    stateAttributesMapping: {
      direction: (v: TabsDirection) => ({ 'data-direction': v }),
    },
    props: { 'aria-hidden': true, ...otherProps },
  });
});
