import type { ReactElement } from 'react';

import { withCardStateProvider, withFloatingTree } from '@/ui/elements/contexts';

import { withCoreUserGuard } from '../../contexts';
import { useFloatingMenuController } from '../../hooks/useFloatingMenuController';
import { useUserButtonRootModel } from './user-button.model';
import { UserButtonFloatingView, UserButtonRootView } from './user-button.view';
import { useUserButtonTriggerModel } from './user-button-trigger.model';
import { UserButtonPopover } from './UserButtonPopover';

const UserButtonWithFloatingTree = withFloatingTree<{ children: ReactElement; defaultOpen?: boolean }>(
  ({ children, defaultOpen }) => {
    const controller = useFloatingMenuController({ defaultOpen, placement: 'bottom-end' });
    const trigger = useUserButtonTriggerModel(controller.isOpen);

    return (
      <UserButtonFloatingView
        {...controller}
        trigger={trigger}
      >
        {children}
      </UserButtonFloatingView>
    );
  },
);

const UserButtonInternal = () => {
  const model = useUserButtonRootModel();

  return (
    <UserButtonRootView>
      {model.standalone ? (
        <UserButtonPopover close={typeof model.standalone === 'function' ? model.standalone : undefined} />
      ) : (
        <UserButtonWithFloatingTree defaultOpen={model.defaultOpen}>
          <UserButtonPopover />
        </UserButtonWithFloatingTree>
      )}
    </UserButtonRootView>
  );
};

export const UserButton = withCoreUserGuard(withCardStateProvider(UserButtonInternal));
