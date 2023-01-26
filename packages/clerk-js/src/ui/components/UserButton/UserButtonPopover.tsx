import type { ActiveSessionResource } from '@clerk/types';
import React from 'react';

import { useCoreSession, useCoreUser, useEnvironment, useUserButtonContext } from '../../contexts';
import { descriptors, localizationKeys } from '../../customizables';
import { Action, Actions, PopoverCard, PreviewButton, SecondaryActions, UserPreview } from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { CogFilled, Plus, SignOut, SignOutDouble, SwitchArrows } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { useMultisessionActions } from './useMultisessionActions';

type UserButtonPopoverProps = { close: () => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const UserButtonPopover = React.forwardRef<HTMLDivElement, UserButtonPopoverProps>((props, ref) => {
  const { close, ...rest } = props;
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

  const addAccountButton = (
    <Action
      icon={Plus}
      label={localizationKeys('userButton.action__addAccount')}
      onClick={handleAddAccountClicked}
    />
  );

  const sessionActions = authConfig.singleSessionMode ? null : otherSessions.length > 0 ? (
    <>
      <SecondaryActions>
        {otherSessions.map(session => (
          <PreviewButton
            key={session.id}
            icon={SwitchArrows}
            sx={t => ({ height: t.sizes.$14, borderRadius: 0 })}
            onClick={handleSessionClicked(session)}
          >
            <UserPreview
              user={session.user}
              size='sm'
              avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
            />
          </PreviewButton>
        ))}
        {addAccountButton}
      </SecondaryActions>
      <Actions>
        <Action
          icon={SignOutDouble}
          label={localizationKeys('userButton.action__signOutAll')}
          onClick={handleSignOutAllClicked}
        />
      </Actions>
    </>
  ) : (
    <SecondaryActions>{addAccountButton}</SecondaryActions>
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
            elementId={'userButton'}
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
