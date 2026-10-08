import type { ElementDescriptor, ElementId } from '@/customizables/elementDescriptors';
import { Action, Actions, SmallAction, SmallActions } from '@/ui/elements/Actions';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { UserPreviewView } from '@/ui/elements/user-preview.view';

import { USER_BUTTON_ITEM_ID } from '../../constants';
import type { LocalizationKey } from '../../customizables';
import { descriptors, Flex, useLocalizations } from '../../customizables';
import { Add, ArrowRight, Cog, SignOut } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import type { DefaultItemIds, MenuItem } from '../../utils/createCustomMenuItems';
import type { MultiSessionActionsData, SingleSessionActionsData } from './session-actions.types';
import { userButtonMessages } from './user-button.messages';

export const SingleSessionActionsView = (props: SingleSessionActionsData) => {
  const { t } = useLocalizations();

  const commonActionSx: ThemableCssProp = t => ({
    borderTopWidth: t.borderWidths.$normal,
    borderTopStyle: t.borderStyles.$solid,
    borderTopColor: t.colors.$borderAlpha100,
    padding: `${t.space.$4} ${t.space.$5}`,
  });

  return (
    <Actions
      role='group'
      aria-label={t(userButtonMessages.accounts.actions)}
      elementDescriptor={descriptors.userButtonPopoverActions}
      elementId={descriptors.userButtonPopoverActions.setId('singleSession')}
      sx={t => ({
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
      })}
    >
      {props.menuItems?.map((item: MenuItem) => {
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
            onClick={item.id === USER_BUTTON_ITEM_ID.SIGN_OUT ? props.onSignOut : () => props.onMenuItemClick(item)}
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

export const MultiSessionActionsView = (props: MultiSessionActionsData) => {
  const { t } = useLocalizations();

  return (
    <>
      {props.hasOnlyDefaultItems ? (
        <SmallActions
          role='group'
          aria-label={t(userButtonMessages.accounts.actions)}
          elementDescriptor={descriptors.userButtonPopoverActions}
          elementId={descriptors.userButtonPopoverActions.setId('multiSession')}
        >
          <Flex
            justify='between'
            sx={t => ({
              marginInlineStart: `calc(${t.sizes.$9} + ${t.space.$4})`,
              padding: `0 ${t.space.$5} ${t.space.$4}`,
              gap: t.space.$2,
            })}
          >
            <SmallAction
              elementDescriptor={descriptors.userButtonPopoverActionButton}
              elementId={descriptors.userButtonPopoverActionButton.setId('manageAccount')}
              iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
              iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('manageAccount')}
              iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
              iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('manageAccount')}
              icon={Cog}
              label={userButtonMessages.accounts.manage}
              onClick={props.onManageAccount}
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
              label={userButtonMessages.accounts.signOut}
              onClick={props.onSignOut}
              focusRing
            />
          </Flex>
        </SmallActions>
      ) : (
        <SmallActions
          role='group'
          aria-label={t(userButtonMessages.accounts.actions)}
          elementDescriptor={descriptors.userButtonPopoverActions}
          elementId={descriptors.userButtonPopoverActions.setId('multiSession')}
          sx={t => ({
            gap: t.space.$1,
            paddingBottom: t.space.$2,
          })}
        >
          {props.menuItems?.map((item: MenuItem) => {
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
                onClick={item.id === USER_BUTTON_ITEM_ID.SIGN_OUT ? props.onSignOut : () => props.onMenuItemClick(item)}
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
        role='group'
        aria-label={t(userButtonMessages.accounts.sessions)}
        sx={t => ({
          borderTopStyle: t.borderStyles.$solid,
          borderTopWidth: t.borderWidths.$normal,
          borderTopColor: t.colors.$borderAlpha100,
        })}
      >
        {props.otherSessions.map(session => (
          <PreviewButton
            key={session.id}
            icon={ArrowRight}
            onClick={() => {
              void session.onClick();
            }}
          >
            <UserPreviewView {...session.preview} />
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
          label={userButtonMessages.accounts.add}
          onClick={props.onAddAccount}
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

export type SignOutAllActionsProps = {
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

export const SignOutAllActionsView = (props: SignOutAllActionsProps) => {
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
  const { t } = useLocalizations();
  return (
    <Actions
      role='group'
      aria-label={t(label || userButtonMessages.accounts.signOutAll)}
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
        label={label || userButtonMessages.accounts.signOutAll}
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
