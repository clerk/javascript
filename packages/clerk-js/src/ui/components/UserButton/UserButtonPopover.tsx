import { useSession, useUser } from '@clerk/shared/react';
import type { ActiveSessionResource } from '@clerk/types';
import React from 'react';

import { useEnvironment, useUserButtonContext } from '../../contexts';
import { descriptors, localizationKeys } from '../../customizables';
import { Action, Actions, PopoverCard, PreviewButton, RootBox, SecondaryActions, UserPreview } from '../../elements';
import { Add, SignOut, SwitchArrowRight } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { MultiSessionActions, SingleSessionActions } from './SessionActions';
import { useMultisessionActions } from './useMultisessionActions';

type UserButtonPopoverProps = { close: () => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const UserButtonPopover = React.forwardRef<HTMLDivElement, UserButtonPopoverProps>((props, ref) => {
  const { close, ...rest } = props;
  const { session } = useSession() as { session: ActiveSessionResource };
  const { authConfig } = useEnvironment();
  const { user } = useUser();
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
      elementDescriptor={descriptors.userButtonPopoverActionButton}
      elementId={descriptors.userButtonPopoverActionButton.setId('addAccount')}
      iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
      iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('addAccount')}
      iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
      iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('addAccount')}
      icon={Add}
      label={localizationKeys('userButton.action__addAccount')}
      onClick={handleAddAccountClicked}
      sx={t => ({
        backgroundColor: t.colors.$colorBackground,
        borderBottom: 'none',
      })}
      iconSx={t => ({
        color: t.colors.$blackAlpha400,
        width: t.sizes.$9,
        height: t.sizes.$6,
      })}
      iconBoxSx={t => ({
        minHeight: t.sizes.$9,
        minWidth: t.sizes.$6,
        alignItems: 'center',
      })}
      spinnerSize='md'
    />
  );

  const signOutAllButton = (
    <Actions
      role='menu'
      sx={t => ({
        padding: t.space.$2,
        borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha200}`,
      })}
    >
      <Action
        elementDescriptor={descriptors.userButtonPopoverActionButton}
        elementId={descriptors.userButtonPopoverActionButton.setId('signOutAll')}
        iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('signOutAll')}
        iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
        iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('signOutAll')}
        icon={SignOut}
        label={localizationKeys('userButton.action__signOutAll')}
        onClick={handleSignOutAllClicked}
        variant='ghostDanger'
        sx={t => ({
          color: t.colors.$blackAlpha600,
          padding: `${t.space.$2} ${t.space.$3}`,
          borderBottom: 'none',
          borderRadius: t.radii.$lg,
        })}
        spinnerSize='md'
      />
    </Actions>
  );

  const sessionActions = (
    <SecondaryActions role='menu'>
      {otherSessions.map(session => (
        <PreviewButton
          key={session.id}
          icon={SwitchArrowRight}
          sx={t => ({
            borderRadius: 0,
            borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
            backgroundColor: t.colors.$colorBackground,
          })}
          onClick={handleSessionClicked(session)}
          role='menuitem'
        >
          <UserPreview user={session.user} />
        </PreviewButton>
      ))}
      {addAccountButton}
    </SecondaryActions>
  );

  return (
    <RootBox elementDescriptor={descriptors.userButtonPopoverRootBox}>
      <PopoverCard.Root
        elementDescriptor={descriptors.userButtonPopoverCard}
        ref={ref}
        role='dialog'
        aria-label='User button popover'
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
              session={session}
            />
          ) : (
            <>
              <MultiSessionActions
                handleManageAccountClicked={handleManageAccountClicked}
                handleSignOutSessionClicked={handleSignOutSessionClicked}
                session={session}
              />
              {sessionActions}
            </>
          )}
        </PopoverCard.Content>
        <PopoverCard.Footer elementDescriptor={descriptors.userButtonPopoverFooter}>
          {!authConfig.singleSessionMode && signOutAllButton}
        </PopoverCard.Footer>
      </PopoverCard.Root>
    </RootBox>
  );
});
