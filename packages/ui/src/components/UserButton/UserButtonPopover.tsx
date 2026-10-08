import { forwardRef } from 'react';

import type { PopoverCard } from '@/ui/elements/PopoverCard';

import type { PropsOfComponent } from '../../styledSystem';
import { useMultisessionController } from './multisession.controller';
import { SignOutAllActionsView } from './session-actions.view';
import { MultiSessionActions, SingleSessionActions } from './SessionActions';
import type { UserButtonPopoverModel } from './user-button.types';
import { useUserButtonPopoverModel } from './user-button-popover.model';
import { UserButtonPopoverView } from './user-button-popover.view';

type UserButtonPopoverProps = { close?: (open: boolean) => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const UserButtonPopover = forwardRef<HTMLDivElement, UserButtonPopoverProps>((props, ref) => {
  const model = useUserButtonPopoverModel();
  return model ? (
    <UserButtonPopoverContent
      {...props}
      key={model.multisession.scopeKey}
      model={model}
      ref={ref}
    />
  ) : null;
});

const UserButtonPopoverContent = forwardRef<HTMLDivElement, UserButtonPopoverProps & { model: UserButtonPopoverModel }>(
  (props, ref) => {
    const { close: unsafeClose, model, ...rest } = props;
    const close = () => unsafeClose?.(false);
    const controller = useMultisessionController(model.multisession, {
      userProfileMode: model.userProfileMode,
      actionCompleteCallback: close,
    });
    const actions = model.singleSessionMode ? (
      <SingleSessionActions
        handleManageAccountClicked={controller.handleManageAccountClicked}
        handleSignOutSessionClicked={controller.handleSignOutSessionClicked}
        handleUserProfileActionClicked={controller.handleUserProfileActionClicked}
        session={model.session}
        canRun={model.multisession.canRun}
        completedCallback={close}
      />
    ) : (
      <MultiSessionActions
        session={model.session}
        canRun={model.multisession.canRun}
        otherSessions={controller.otherSessions}
        handleManageAccountClicked={controller.handleManageAccountClicked}
        handleSignOutSessionClicked={controller.handleSignOutSessionClicked}
        handleSessionClicked={controller.handleSessionClicked}
        handleAddAccountClicked={controller.handleAddAccountClicked}
        handleUserProfileActionClicked={controller.handleUserProfileActionClicked}
        completedCallback={close}
      />
    );
    const footerActions =
      !model.singleSessionMode && controller.otherSessions.length > 0 ? (
        <SignOutAllActionsView handleSignOutAllClicked={controller.handleSignOutAllClicked} />
      ) : null;

    return (
      <UserButtonPopoverView
        {...rest}
        userPreview={model.userPreview}
        isStandalone={model.isStandalone}
        actions={actions}
        footerActions={footerActions}
        ref={ref}
      />
    );
  },
);
