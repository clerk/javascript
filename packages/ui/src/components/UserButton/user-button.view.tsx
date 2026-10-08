import { cloneElement, type ReactElement } from 'react';

import { Popover } from '@/ui/elements/Popover';

import { Flow } from '../../customizables';
import type { FloatingMenuController } from '../../hooks/useFloatingMenuController';
import type { UserButtonTriggerData } from './user-button.types';
import { UserButtonTriggerView } from './user-button-trigger.view';

export const UserButtonRootView = ({ children }: { children: React.ReactNode }) => (
  <Flow.Root
    flow='userButton'
    sx={{ display: 'inline-flex' }}
  >
    {children}
  </Flow.Root>
);

export const UserButtonFloatingView = (
  props: FloatingMenuController & { children: ReactElement; trigger: UserButtonTriggerData },
) => (
  <>
    <UserButtonTriggerView
      ref={props.reference}
      isOpen={props.isOpen}
      {...props.triggerProps}
      {...props.trigger}
    />
    <Popover
      nodeId={props.nodeId}
      context={props.context}
      isOpen={props.isOpen}
      order={['content']}
      initialFocus={props.popoverRef}
    >
      {cloneElement(props.children, {
        ...props.popoverProps,
        close: props.close,
      })}
    </Popover>
  </>
);
