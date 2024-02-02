import type { ActiveSessionResource } from '@clerk/types';

import { descriptors, Flex, localizationKeys } from '../../customizables';
import { Action, Actions, PreviewButton, SmallAction, UserPreview } from '../../elements';
import { Add, CogFilled, SignOut, SwitchArrowRight } from '../../icons';

type SingleSessionActionsProps = {
  handleManageAccountClicked: () => Promise<unknown> | void;
  handleSignOutSessionClicked: (session: ActiveSessionResource) => () => Promise<unknown> | void;
  session: ActiveSessionResource;
};

export const SingleSessionActions = (props: SingleSessionActionsProps) => {
  const { handleManageAccountClicked, handleSignOutSessionClicked, session } = props;

  return (
    <Actions
      role='menu'
      elementDescriptor={descriptors.userButtonPopoverActions}
      elementId={descriptors.userButtonPopoverActions.setId('singleSession')}
    >
      <Action
        elementDescriptor={descriptors.userButtonPopoverActionButton}
        elementId={descriptors.userButtonPopoverActionButton.setId('manageAccount')}
        iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('manageAccount')}
        iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
        iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('manageAccount')}
        icon={CogFilled}
        label={localizationKeys('userButton.action__manageAccount')}
        onClick={handleManageAccountClicked}
        sx={t => ({
          borderTop: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
          padding: `${t.space.$4} ${t.space.$5}`,
        })}
      />
      <Action
        elementDescriptor={descriptors.userButtonPopoverActionButton}
        elementId={descriptors.userButtonPopoverActionButton.setId('signOut')}
        iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('signOut')}
        iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
        iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('signOut')}
        icon={SignOut}
        label={localizationKeys('userButton.action__signOut')}
        onClick={handleSignOutSessionClicked(session)}
        sx={[
          t => ({
            borderBottomLeftRadius: t.radii.$lg,
            borderBottomRightRadius: t.radii.$lg,
            padding: `${t.space.$4} ${t.space.$5}`,
          }),
        ]}
      />
    </Actions>
  );
};

type MultiSessionActionsProps = {
  handleManageAccountClicked: () => Promise<unknown> | void;
  handleSignOutSessionClicked: (session: ActiveSessionResource) => () => Promise<unknown> | void;
  handleSessionClicked: (session: ActiveSessionResource) => () => Promise<unknown> | void;
  handleAddAccountClicked: () => Promise<unknown> | void;
  session: ActiveSessionResource;
  otherSessions: ActiveSessionResource[];
};

export const MultiSessionActions = (props: MultiSessionActionsProps) => {
  const {
    handleManageAccountClicked,
    handleSignOutSessionClicked,
    handleSessionClicked,
    handleAddAccountClicked,
    session,
    otherSessions,
  } = props;

  return (
    <>
      <Actions
        role='menu'
        elementDescriptor={descriptors.userButtonPopoverActions}
        elementId={descriptors.userButtonPopoverActions.setId('multiSession')}
        sx={t => ({
          borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
        })}
      >
        <Flex
          justify='between'
          sx={t => ({ marginLeft: t.space.$12, padding: `0 ${t.space.$5} ${t.space.$4}`, gap: t.space.$2 })}
        >
          <SmallAction
            elementDescriptor={descriptors.userButtonPopoverActionButton}
            elementId={descriptors.userButtonPopoverActionButton.setId('manageAccount')}
            iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
            iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('manageAccount')}
            iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
            iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('manageAccount')}
            icon={CogFilled}
            label={localizationKeys('userButton.action__manageAccount')}
            onClick={handleManageAccountClicked}
          />
          <SmallAction
            elementDescriptor={descriptors.userButtonPopoverActionButton}
            elementId={descriptors.userButtonPopoverActionButton.setId('signOut')}
            iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
            iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('signOut')}
            iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
            iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('signOut')}
            icon={SignOut}
            label={localizationKeys('userButton.action__signOut')}
            onClick={handleSignOutSessionClicked(session)}
          />
        </Flex>
      </Actions>
      <Actions role='menu'>
        {otherSessions.map(session => (
          <PreviewButton
            key={session.id}
            icon={SwitchArrowRight}
            onClick={handleSessionClicked(session)}
            role='menuitem'
          >
            <UserPreview user={session.user} />
          </PreviewButton>
        ))}
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
          iconSx={t => ({
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
      </Actions>
    </>
  );
};

type SignOutAllActionsProps = {
  handleSignOutAllClicked: () => Promise<unknown> | void;
};

export const SignOutAllActions = (props: SignOutAllActionsProps) => {
  const { handleSignOutAllClicked } = props;
  return (
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
        sx={t => ({
          color: t.colors.$colorTextSecondary,
          padding: `${t.space.$2} ${t.space.$3}`,
          borderBottom: 'none',
          borderRadius: t.radii.$lg,
        })}
        spinnerSize='md'
      />
    </Actions>
  );
};
