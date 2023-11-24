import { useSession, useUser } from '@clerk/shared/react';
import type { ActiveSessionResource } from '@clerk/types';
import React from 'react';

import { useEnvironment, useUserButtonContext } from '../../contexts';
import { descriptors, localizationKeys } from '../../customizables';
import { Action, Actions, PopoverCard, PreviewButton, RootBox, SecondaryActions, UserPreview } from '../../elements';
import { Plus, SignOut, SwitchArrowRight } from '../../icons';
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
      textElementDescriptor={descriptors.userButtonPopoverActionButtonText}
      textElementId={descriptors.userButtonPopoverActionButtonText.setId('addAccount')}
      icon={Plus}
      label={localizationKeys('userButton.action__addAccount')}
      onClick={handleAddAccountClicked}
      sx={t => ({
        borderBottomLeftRadius: t.radii.$lg,
        borderBottomRightRadius: t.radii.$lg,
      })}
    />
  );

  const signOutAllButton = (
    <Actions
      role='menu'
      sx={t => ({
        padding: t.space.$2,
        backgroundColor: t.colors.$blackAlpha100,
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
        textElementDescriptor={descriptors.userButtonPopoverActionButtonText}
        textElementId={descriptors.userButtonPopoverActionButtonText.setId('signOutAll')}
        icon={SignOut}
        label={localizationKeys('userButton.action__signOutAll')}
        onClick={handleSignOutAllClicked}
        sx={t => ({
          padding: `${t.space.$2} ${t.space.$3}`,
          backgroundColor: t.colors.$transparent,
          borderBottom: 'none',
          borderRadius: t.radii.$lg,
          ':hover': {
            backgroundColor: t.colors.$danger50,
          },
          ':hover .cl-userButtonPopoverActionButtonText__signOutAll': {
            color: t.colors.$danger400,
          },
          ':hover .cl-userButtonPopoverActionButtonIcon__signOutAll': {
            color: t.colors.$danger400,
          },
        })}
      />
    </Actions>
  );

  const sessionActions = (
    <>
      <SecondaryActions
        role='menu'
        sx={t => ({ backgroundColor: t.colors.$blackAlpha100 })}
      >
        {otherSessions.map(session => (
          <PreviewButton
            key={session.id}
            icon={SwitchArrowRight}
            sx={t => ({
              height: t.sizes.$17,
              borderRadius: 0,
              borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
              backgroundColor: t.colors.$white,
            })}
            onClick={handleSessionClicked(session)}
            role='menuitem'
          >
            <UserPreview
              user={session.user}
              size='sm'
            />
          </PreviewButton>
        ))}
        {addAccountButton}
      </SecondaryActions>
      {signOutAllButton}
    </>
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
        <PopoverCard.Main elementDescriptor={descriptors.userButtonPopoverMain}>
          <UserPreview
            elementId={'userButton'}
            user={user}
            sx={t => ({
              padding: `${t.space.$4} ${t.space.$5}`,
            })}
            size='sm'
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
        </PopoverCard.Main>
        <PopoverCard.Footer elementDescriptor={descriptors.userButtonPopoverFooter} />
      </PopoverCard.Root>
    </RootBox>
  );
});
