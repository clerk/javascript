import { useSession, useUser } from '@clerk/shared/react';
import type { SignedInSessionResource } from '@clerk/shared/types';
import React from 'react';

import { PopoverCard } from '@/ui/elements/PopoverCard';
import { RootBox } from '@/ui/elements/RootBox';
import { UserPreview } from '@/ui/elements/UserPreview';

import { useEnvironment, useUserButtonContext } from '../../contexts';
import { descriptors } from '../../customizables';
import type { PropsOfComponent } from '../../styledSystem';
import { MultiSessionActions, SignOutAllActions, SingleSessionActions } from './SessionActions';
import { useMultisessionActions } from './useMultisessionActions';

type UserButtonPopoverProps = { close?: (open: boolean) => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const UserButtonPopover = React.forwardRef<HTMLDivElement, UserButtonPopoverProps>((props, ref) => {
  const { close: unsafeClose, ...rest } = props;
  const close = () => unsafeClose?.(false);
  const { session } = useSession() as { session: SignedInSessionResource };
  const userButtonContext = useUserButtonContext();
  const { __experimental_asStandalone } = userButtonContext;
  const { authConfig } = useEnvironment();
  const { user } = useUser();
  const {
    handleAddAccountClicked,
    handleManageAccountClicked,
    handleSessionClicked,
    handleSignOutAllClicked,
    handleSignOutSessionClicked,
    handleUserProfileActionClicked,
    otherSessions,
  } = useMultisessionActions({ ...userButtonContext, actionCompleteCallback: close, user });

  return (
    <RootBox elementDescriptor={descriptors.userButtonPopoverRootBox}>
      <PopoverCard.Root
        elementDescriptor={descriptors.userButtonPopoverCard}
        ref={ref}
        role='dialog'
        aria-label='User button popover'
        shouldEntryAnimate={!__experimental_asStandalone}
        {...rest}
      >
        <PopoverCard.Content elementDescriptor={descriptors.userButtonPopoverMain}>
          <UserPreview
            elementId={'userButton'}
            user={user}
            sx={t => ({
              width: '100%',
              padding: `${t.space.$4} ${t.space.$5}`,
            })}
          />
          {authConfig.singleSessionMode ? (
            <SingleSessionActions
              handleManageAccountClicked={handleManageAccountClicked}
              handleSignOutSessionClicked={handleSignOutSessionClicked}
              handleUserProfileActionClicked={handleUserProfileActionClicked}
              session={session}
              completedCallback={close}
            />
          ) : (
            <MultiSessionActions
              session={session}
              otherSessions={otherSessions}
              handleManageAccountClicked={handleManageAccountClicked}
              handleSignOutSessionClicked={handleSignOutSessionClicked}
              handleSessionClicked={handleSessionClicked}
              handleAddAccountClicked={handleAddAccountClicked}
              handleUserProfileActionClicked={handleUserProfileActionClicked}
              completedCallback={close}
            />
          )}
        </PopoverCard.Content>
        <PopoverCard.Footer elementDescriptor={descriptors.userButtonPopoverFooter}>
          {!authConfig.singleSessionMode && otherSessions.length > 0 && (
            <SignOutAllActions handleSignOutAllClicked={handleSignOutAllClicked} />
          )}
        </PopoverCard.Footer>
      </PopoverCard.Root>
    </RootBox>
  );
});
