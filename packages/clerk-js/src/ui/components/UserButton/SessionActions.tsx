import type { ActiveSessionResource } from '@clerk/types';

import { descriptors, Flex, localizationKeys } from '../../customizables';
import { Action, Actions, SmallAction } from '../../elements';
import { CogFilled, SignOut } from '../../icons';

type SessionActionsProps = {
  handleManageAccountClicked: () => Promise<unknown> | void;
  handleSignOutSessionClicked: (session: ActiveSessionResource) => () => Promise<unknown> | void;
  session: ActiveSessionResource;
};

export const SingleSessionActions = (props: SessionActionsProps) => {
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

export const MultiSessionActions = (props: SessionActionsProps) => {
  const { handleManageAccountClicked, handleSignOutSessionClicked, session } = props;

  return (
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
          sx={t => ({
            color: t.colors.$colorTextOnSecondaryBackground,
          })}
        />
      </Flex>
    </Actions>
  );
};
