import type { SignedInSessionResource } from '@clerk/shared/types';

import { Action, Actions, SmallAction, SmallActions } from '@/ui/elements/Actions';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { UserPreview } from '@/ui/elements/UserPreview';

import type { ElementDescriptor, ElementId } from '../../../ui/customizables/elementDescriptors';
import { useRouter } from '../../../ui/router';
import { USER_BUTTON_ITEM_ID } from '../../constants';
import { useUserButtonContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { descriptors, Flex, localizationKeys } from '../../customizables';
import { Add, CogFilled, SignOut, SwitchArrowRight } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import type { DefaultItemIds, MenuItem } from '../../utils/createCustomMenuItems';

type SingleSessionActionsProps = {
  handleManageAccountClicked: () => Promise<unknown> | void;
  handleSignOutSessionClicked: (session: SignedInSessionResource) => () => Promise<unknown> | void;
  handleUserProfileActionClicked: (startPath?: string) => Promise<unknown> | void;
  session: SignedInSessionResource;
  completedCallback: () => void;
};

export const SingleSessionActions = (props: SingleSessionActionsProps) => {
  const { navigate } = useRouter();
  const { handleManageAccountClicked, handleSignOutSessionClicked, handleUserProfileActionClicked, session } = props;

  const { menutItems } = useUserButtonContext();

  const commonActionSx: ThemableCssProp = t => ({
    borderTopWidth: t.borderWidths.$normal,
    borderTopStyle: t.borderStyles.$solid,
    borderTopColor: t.colors.$borderAlpha100,
    padding: `${t.space.$4} ${t.space.$5}`,
  });

  const handleActionClick = async (menuItem: MenuItem) => {
    if (menuItem?.path) {
      await navigate(menuItem.path);
      return props?.completedCallback();
    }
    if (menuItem.id === USER_BUTTON_ITEM_ID.MANAGE_ACCOUNT) {
      return await handleManageAccountClicked();
    }

    if (menuItem?.open) {
      return handleUserProfileActionClicked(menuItem.open);
    }

    menuItem.onClick?.();
    return props?.completedCallback();
  };

  return (
    <Actions
      role='menu'
      elementDescriptor={descriptors.userButtonPopoverActions}
      elementId={descriptors.userButtonPopoverActions.setId('singleSession')}
      sx={t => ({
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
      })}
    >
      {menutItems?.map((item: MenuItem) => {
        const isDefaultItem = Object.values(USER_BUTTON_ITEM_ID).includes(item.id);
        let itemDescriptors;

        // We are using different element descriptors for default menu items vs custom items
        // to maintain backwards compatibility and avoid breaking existing descriptor usage.
        // This check ensures that default items use their specific descriptors, while custom
        // items use the generic custom item descriptors.
        if (isDefaultItem) {
          itemDescriptors = {
            elementDescriptor: descriptors.userButtonPopoverActionButton,
            elementId: descriptors.userButtonPopoverActionButton.setId(item.id as DefaultItemIds),
            iconBoxElementDescriptor: descriptors.userButtonPopoverActionButtonIconBox,
            iconBoxElementId: descriptors.userButtonPopoverActionButtonIconBox.setId(item.id as DefaultItemIds),
            iconElementDescriptor: descriptors.userButtonPopoverActionButtonIcon,
            iconElementId: descriptors.userButtonPopoverActionButtonIcon.setId(item.id as DefaultItemIds),
          };
        } else {
          itemDescriptors = {
            elementDescriptor: descriptors.userButtonPopoverCustomItemButton,
            elementId: descriptors.userButtonPopoverCustomItemButton.setId(item.id),
            iconBoxElementDescriptor: descriptors.userButtonPopoverCustomItemButtonIconBox,
            iconBoxElementId: descriptors.userButtonPopoverCustomItemButtonIconBox.setId(item.id),
            iconElementDescriptor: descriptors.userButtonPopoverActionItemButtonIcon,
            iconElementId: descriptors.userButtonPopoverActionItemButtonIcon.setId(item.id),
          };
        }

        return (
          <Action
            key={item.id}
            {...itemDescriptors}
            icon={item.icon}
            label={item.name}
            onClick={
              item.id === USER_BUTTON_ITEM_ID.SIGN_OUT
                ? handleSignOutSessionClicked(session)
                : () => handleActionClick(item)
            }
            sx={commonActionSx}
            iconSx={t => ({
              width: t.sizes.$4,
              height: t.sizes.$4,
            })}
          />
        );
      })}
    </Actions>
  );
};

type MultiSessionActionsProps = {
  handleManageAccountClicked: () => Promise<unknown> | void;
  handleSignOutSessionClicked: (session: SignedInSessionResource) => () => Promise<unknown> | void;
  handleSessionClicked: (session: SignedInSessionResource) => () => Promise<unknown> | void;
  handleAddAccountClicked: () => Promise<unknown> | void;
  handleUserProfileActionClicked: (startPath?: string) => Promise<unknown> | void;
  session: SignedInSessionResource;
  otherSessions: SignedInSessionResource[];
  completedCallback: () => void;
};

export const MultiSessionActions = (props: MultiSessionActionsProps) => {
  const { navigate } = useRouter();
  const {
    handleManageAccountClicked,
    handleSignOutSessionClicked,
    handleSessionClicked,
    handleAddAccountClicked,
    handleUserProfileActionClicked,
    session,
    otherSessions,
  } = props;

  const { menutItems } = useUserButtonContext();

  const handleActionClick = async (route: MenuItem) => {
    if (route?.path) {
      await navigate(route.path);
      return props?.completedCallback();
    }
    if (route.id === USER_BUTTON_ITEM_ID.MANAGE_ACCOUNT) {
      return await handleManageAccountClicked();
    }

    if (route?.open) {
      return handleUserProfileActionClicked(route.open);
    }

    route.onClick?.();
    return props?.completedCallback();
  };

  const hasOnlyDefaultItems = menutItems.every((item: MenuItem) =>
    Object.values(USER_BUTTON_ITEM_ID).includes(item.id),
  );

  return (
    <>
      {hasOnlyDefaultItems ? (
        <SmallActions
          role='menu'
          elementDescriptor={descriptors.userButtonPopoverActions}
          elementId={descriptors.userButtonPopoverActions.setId('multiSession')}
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
              focusRing
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
              focusRing
            />
          </Flex>
        </SmallActions>
      ) : (
        <SmallActions
          role='menu'
          elementDescriptor={descriptors.userButtonPopoverActions}
          elementId={descriptors.userButtonPopoverActions.setId('multiSession')}
          sx={t => ({
            gap: t.space.$1,
            paddingBottom: t.space.$2,
          })}
        >
          {menutItems?.map((item: MenuItem) => {
            const isDefaultItem = Object.values(USER_BUTTON_ITEM_ID).includes(item.id);
            let itemDescriptors;

            // We are using different element descriptors for default menu items vs custom items
            // to maintain backwards compatibility and avoid breaking existing descriptor usage.
            // This check ensures that default items use their specific descriptors, while custom
            // items use the generic custom item descriptors.
            if (isDefaultItem) {
              itemDescriptors = {
                elementDescriptor: descriptors.userButtonPopoverActionButton,
                elementId: descriptors.userButtonPopoverActionButton.setId(item.id as DefaultItemIds),
                iconBoxElementDescriptor: descriptors.userButtonPopoverActionButtonIconBox,
                iconBoxElementId: descriptors.userButtonPopoverActionButtonIconBox.setId(item.id as DefaultItemIds),
                iconElementDescriptor: descriptors.userButtonPopoverActionButtonIcon,
                iconElementId: descriptors.userButtonPopoverActionButtonIcon.setId(item.id as DefaultItemIds),
              };
            } else {
              itemDescriptors = {
                elementDescriptor: descriptors.userButtonPopoverCustomItemButton,
                elementId: descriptors.userButtonPopoverCustomItemButton.setId(item.id),
                iconBoxElementDescriptor: descriptors.userButtonPopoverCustomItemButtonIconBox,
                iconBoxElementId: descriptors.userButtonPopoverCustomItemButtonIconBox.setId(item.id),
                iconElementDescriptor: descriptors.userButtonPopoverActionItemButtonIcon,
                iconElementId: descriptors.userButtonPopoverActionItemButtonIcon.setId(item.id),
              };
            }
            return (
              <Action
                key={item.id}
                {...itemDescriptors}
                icon={item.icon}
                label={item.name}
                onClick={
                  item.id === USER_BUTTON_ITEM_ID.SIGN_OUT
                    ? handleSignOutSessionClicked(session)
                    : () => handleActionClick(item)
                }
                sx={t => ({
                  border: 0,
                  padding: `${t.space.$2} ${t.space.$5}`,
                  gap: t.space.$3x5,
                })}
                iconSx={t => ({
                  width: t.sizes.$4,
                  height: t.sizes.$4,
                })}
                iconBoxSx={t => ({
                  minHeight: t.sizes.$4,
                  minWidth: t.sizes.$4,
                  alignItems: 'center',
                })}
              />
            );
          })}
        </SmallActions>
      )}

      <Actions
        role='menu'
        sx={t => ({
          borderTopStyle: t.borderStyles.$solid,
          borderTopWidth: t.borderWidths.$normal,
          borderTopColor: t.colors.$borderAlpha100,
        })}
      >
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
  elementDescriptor?: ElementDescriptor;
  elementId?: ElementId;
  iconBoxElementDescriptor?: ElementDescriptor;
  iconBoxElementId?: ElementId;
  iconElementDescriptor?: ElementDescriptor;
  iconElementId?: ElementId;
  label?: LocalizationKey;
  sx?: ThemableCssProp;
  actionSx?: ThemableCssProp;
};

export const SignOutAllActions = (props: SignOutAllActionsProps) => {
  const {
    handleSignOutAllClicked,
    elementDescriptor,
    elementId,
    iconBoxElementDescriptor,
    iconBoxElementId,
    iconElementDescriptor,
    iconElementId,
    label,
    sx,
    actionSx,
  } = props;
  return (
    <Actions
      role='menu'
      sx={[
        t => ({
          padding: t.space.$2,
        }),
        sx,
      ]}
    >
      <Action
        elementDescriptor={elementDescriptor || descriptors.userButtonPopoverActionButton}
        elementId={elementId || descriptors.userButtonPopoverActionButton.setId('signOutAll')}
        iconBoxElementDescriptor={iconBoxElementDescriptor || descriptors.userButtonPopoverActionButtonIconBox}
        iconBoxElementId={iconBoxElementId || descriptors.userButtonPopoverActionButtonIconBox.setId('signOutAll')}
        iconElementDescriptor={iconElementDescriptor || descriptors.userButtonPopoverActionButtonIcon}
        iconElementId={iconElementId || descriptors.userButtonPopoverActionButtonIcon.setId('signOutAll')}
        icon={SignOut}
        label={label || localizationKeys('userButton.action__signOutAll')}
        onClick={handleSignOutAllClicked}
        variant='ghost'
        colorScheme='neutral'
        sx={[
          t => ({
            backgroundColor: t.colors.$transparent,
            padding: `${t.space.$2} ${t.space.$3}`,
            borderBottomWidth: 0,
            borderRadius: t.radii.$lg,
          }),
          actionSx,
        ]}
        spinnerSize='md'
      />
    </Actions>
  );
};
