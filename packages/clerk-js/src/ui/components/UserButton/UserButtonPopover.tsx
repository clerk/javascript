import { ActiveSessionResource } from '@clerk/types';
import React from 'react';

import { useCoreSession, useCoreUser, useEnvironment, useUserButtonContext } from '../../contexts';
import { descriptors, localizationKeys } from '../../customizables';
import { Action, Actions, PopoverCard, UserPreview } from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { CogFilled, Plus, SignOut, SignOutDouble } from '../../icons';
import { PropsOfComponent } from '../../styledSystem';
import { SessionActions, UserPreviewButton } from './OtherSessionActions';
import { useMultisessionActions } from './useMultisessionActions';

type UserButtonPopoverProps = { isOpen: boolean; close: () => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const UserButtonPopover = React.forwardRef<HTMLDivElement, UserButtonPopoverProps>((props, ref) => {
  const { isOpen, close, ...rest } = props;
  const session = useCoreSession() as ActiveSessionResource;
  const { authConfig } = useEnvironment();
  const user = useCoreUser();
  const {
    handleAddAccountClicked,
    handleManageAccountClicked,
    handleSessionClicked,
    handleSignOutAllClicked,
    handleSignOutSessionClicked,
    otherSessions,
  } = useMultisessionActions({ ...useUserButtonContext(), actionCompleteCallback: close, user });

  if (!isOpen) {
    return null;
  }

  const addAccountButton = (
    <Action
      icon={Plus}
      label={localizationKeys('userButton.action__addAccount')}
      onClick={handleAddAccountClicked}
    />
  );

  const sessionActions = authConfig.singleSessionMode ? null : otherSessions.length > 0 ? (
    <>
      <SessionActions>
        {otherSessions.map(session => (
          <UserPreviewButton
            key={session.id}
            user={session.user}
            onClick={handleSessionClicked(session)}
          />
        ))}
        {addAccountButton}
      </SessionActions>
      <Actions>
        <Action
          icon={SignOutDouble}
          label={localizationKeys('userButton.action__signOutAll')}
          onClick={handleSignOutAllClicked}
        />
      </Actions>
    </>
  ) : (
    <SessionActions>{addAccountButton}</SessionActions>
  );

  return (
    <RootBox elementDescriptor={descriptors.userButtonPopoverRootBox}>
      <PopoverCard.Root
        elementDescriptor={descriptors.userButtonPopoverCard}
        ref={ref}
        {...rest}
      >
        <PopoverCard.Main elementDescriptor={descriptors.userButtonPopoverMain}>
          <UserPreview
            elementId={'userButton' as any}
            user={user}
            sx={theme => ({ padding: `0 ${theme.space.$6}`, marginBottom: theme.space.$2 })}
          />
          <Actions elementDescriptor={descriptors.userButtonPopoverActions}>
            <Action
              elementDescriptor={descriptors.userButtonPopoverActionButton}
              elementId={descriptors.userButtonPopoverActionButton.setId('manageAccount')}
              iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
              iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('manageAccount')}
              iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
              iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('manageAccount')}
              textElementDescriptor={descriptors.userButtonPopoverActionButtonText}
              textElementId={descriptors.userButtonPopoverActionButtonText.setId('manageAccount')}
              icon={CogFilled}
              label={localizationKeys('userButton.action__manageAccount')}
              onClick={handleManageAccountClicked}
            />
            <Action
              elementDescriptor={descriptors.userButtonPopoverActionButton}
              elementId={descriptors.userButtonPopoverActionButton.setId('signOut')}
              iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
              iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('signOut')}
              iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
              iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('signOut')}
              textElementDescriptor={descriptors.userButtonPopoverActionButtonText}
              textElementId={descriptors.userButtonPopoverActionButtonText.setId('signOut')}
              icon={SignOut}
              label={localizationKeys('userButton.action__signOut')}
              onClick={handleSignOutSessionClicked(session)}
            />
          </Actions>
          {sessionActions}
        </PopoverCard.Main>
        <PopoverCard.Footer elementDescriptor={descriptors.userButtonPopoverFooter} />
      </PopoverCard.Root>
    </RootBox>
  );
});
