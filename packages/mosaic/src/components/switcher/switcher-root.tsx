'use client';

import type { ReactElement } from 'react';

import type { PopoverRootProps } from '../popover';
import { Popover } from '../popover';
import { SwitcherRootProvider } from './switcher.context';

export type SwitcherRootProps = Pick<
  PopoverRootProps,
  'open' | 'defaultOpen' | 'onOpenChange' | 'placement' | 'sideOffset' | 'alignOffset' | 'children'
>;

/** Holds the popover's open state; renders no element of its own. */
export function SwitcherRoot({ placement = 'bottom-start', children, ...rest }: SwitcherRootProps): ReactElement {
  return (
    <Popover.Root
      placement={placement}
      {...rest}
    >
      <SwitcherRootProvider value>{children}</SwitcherRootProvider>
    </Popover.Root>
  );
}
