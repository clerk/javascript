import { cloneElement, type ReactElement } from 'react';

import { Popover } from '@/ui/elements/Popover';

import { Flow } from '../../customizables';
import type { FloatingMenuController } from '../../hooks/useFloatingMenuController';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';

export const OrganizationSwitcherRootView = ({ children }: { children: React.ReactNode }) => (
  <Flow.Root
    flow='organizationSwitcher'
    sx={{ display: 'inline-flex' }}
  >
    {children}
  </Flow.Root>
);

export const OrganizationSwitcherFloatingView = ({
  reference,
  isOpen,
  triggerProps,
  nodeId,
  context,
  popoverRef,
  popoverProps,
  close,
  children,
}: FloatingMenuController & {
  children: ReactElement;
}) => (
  <>
    <OrganizationSwitcherTrigger
      ref={reference}
      isOpen={isOpen}
      {...triggerProps}
    />
    <Popover
      nodeId={nodeId}
      context={context}
      isOpen={isOpen}
      order={['content']}
      initialFocus={popoverRef}
    >
      {cloneElement(children, {
        ...popoverProps,
        close: close,
      })}
    </Popover>
  </>
);
