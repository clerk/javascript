import type { ProfileSectionId } from '@clerk/types';
import { isValidElement } from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Flex, Icon, Spinner, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { Plus } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { ArrowBlockButton, Menu, MenuItem, MenuList, MenuTrigger } from '.';

type ProfileSectionProps = Omit<PropsOfComponent<typeof Flex>, 'title'> & {
  title: LocalizationKey;
  subtitle?: LocalizationKey;
  id: ProfileSectionId;
};

const ProfileSectionRoot = (props: ProfileSectionProps) => {
  const { title, children, id, subtitle, sx, ...rest } = props;
  return (
    <Col
      elementDescriptor={descriptors.profileSection}
      elementId={descriptors.profileSection.setId(id)}
      sx={[
        t => ({
          borderTop: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
          padding: `${t.space.$4} 0`,
          gap: t.space.$2,
        }),
        sx,
      ]}
      {...rest}
    >
      <Col
        elementDescriptor={descriptors.profileSectionHeader}
        elementId={descriptors.profileSectionHeader.setId(id)}
        sx={t => ({ gap: t.space.$1 })}
      >
        <SectionHeader
          localizationKey={title}
          elementDescriptor={descriptors.profileSectionTitle}
          elementId={descriptors.profileSectionTitle.setId(id)}
          textElementDescriptor={descriptors.profileSectionTitleText}
          textElementId={descriptors.profileSectionTitleText.setId(id)}
        />
        {subtitle && (
          <SectionSubHeader
            localizationKey={subtitle}
            elementDescriptor={descriptors.profileSectionSubtitle}
            elementId={descriptors.profileSectionSubtitle.setId(id)}
            textElementDescriptor={descriptors.profileSectionSubtitleText}
            textElementId={descriptors.profileSectionSubtitleText.setId(id)}
          />
        )}
      </Col>
      <Col
        elementDescriptor={descriptors.profileSectionContent}
        elementId={descriptors.profileSectionContent.setId(id)}
        gap={2}
        sx={{ width: '100%' }}
      >
        {children}
      </Col>
    </Col>
  );
};

type ProfileSectionItemListProps = PropsOfComponent<typeof Col> & { id: ProfileSectionId };

const ProfileSectionItemList = (props: ProfileSectionItemListProps) => {
  const { children, id, ...rest } = props;
  return (
    <Col
      elementDescriptor={descriptors.profileSectionItemList}
      elementId={descriptors.profileSectionItemList.setId(id)}
      sx={t => ({ gap: t.space.$1 })}
      {...rest}
    >
      {children}
    </Col>
  );
};

type ProfileSectionItemProps = PropsOfComponent<typeof Flex> & { id: ProfileSectionId };

const ProfileSectionItem = (props: ProfileSectionItemProps) => {
  const { children, id, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.profileSectionItem}
      elementId={descriptors.profileSectionItem.setId(id)}
      sx={t => ({
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        padding: `${t.space.$2} ${t.space.$4}`,
      })}
      {...rest}
    >
      {children}
    </Flex>
  );
};

type ProfileSectionButtonProps = PropsOfComponent<typeof ArrowBlockButton> & {
  id: ProfileSectionId;
};

const ProfileSectionButton = (props: ProfileSectionButtonProps) => {
  const { children, leftIcon = Plus, id, sx, localizationKey, ...rest } = props;
  return (
    <ArrowBlockButton
      elementDescriptor={descriptors.profileSectionPrimaryButton}
      elementId={descriptors.profileSectionPrimaryButton.setId(id)}
      variant='ghost'
      sx={[t => ({ justifyContent: 'start', gap: t.space.$2, padding: `${t.space.$2} ${t.space.$4}` }), sx]}
      textLocalizationKey={localizationKey}
      leftIcon={leftIcon}
      leftIconSx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
      {...rest}
    >
      {children}
    </ArrowBlockButton>
  );
};

export type ProfileSectionActionMenuItemProps = PropsOfComponent<typeof MenuItem> & {
  destructive?: boolean;
  leftIcon?: React.ComponentType | React.ReactElement;
  leftIconSx?: ThemableCssProp;
};

export const ProfileSectionActionMenuItem = (props: ProfileSectionActionMenuItemProps) => {
  const { children, isLoading, localizationKey, sx, leftIcon, leftIconSx, ...rest } = props;

  const isIconElement = isValidElement(leftIcon);

  return (
    <MenuItem
      sx={[
        theme => ({
          borderRadius: theme.radii.$sm,
        }),
        sx,
      ]}
      isLoading={isLoading}
      {...rest}
    >
      {(isLoading || leftIcon) && (
        <Flex
          as='span'
          sx={theme => ({ flex: `0 0 ${theme.space.$4}` })}
        >
          {isLoading ? (
            <Spinner
              elementDescriptor={descriptors.spinner}
              size={'sm'}
            />
          ) : !isIconElement && leftIcon ? (
            <Icon
              icon={leftIcon as React.ComponentType}
              sx={[
                theme => ({
                  color: theme.colors.$blackAlpha600,
                  width: theme.sizes.$5,
                }),
                leftIconSx,
              ]}
            />
          ) : (
            leftIcon
          )}
        </Flex>
      )}
      <Text localizationKey={localizationKey} />
    </MenuItem>
  );
};

type ProfileSectionActionMenuProps = {
  children: React.ReactNode;
  destructive?: boolean;
  triggerLocalizationKey?: LocalizationKey;
  triggerSx?: ThemableCssProp;
  elementId?: ProfileSectionId;
};

export const ProfileSectionActionMenu = (props: ProfileSectionActionMenuProps) => {
  const { children, triggerLocalizationKey, elementId, triggerSx } = props;
  return (
    <Flex
      sx={{
        position: 'relative',
      }}
    >
      <Menu elementId={elementId}>
        <MenuTrigger>
          <ArrowBlockButton
            elementDescriptor={descriptors.profileSectionPrimaryButton}
            elementId={descriptors.profileSectionPrimaryButton.setId(elementId)}
            textLocalizationKey={triggerLocalizationKey}
            variant='ghost'
            sx={[
              t => ({ justifyContent: 'start', gap: t.space.$2, padding: `${t.space.$2} ${t.space.$4}` }),
              triggerSx,
            ]}
            leftIcon={Plus}
            leftIconSx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
          />
        </MenuTrigger>
        <MenuList
          asPortal={false}
          sx={t => ({
            width: '100%',
            gap: 2,
            paddingLeft: t.space.$1,
            paddingRight: t.space.$1,
          })}
        >
          {children}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export const ProfileSection = {
  Root: ProfileSectionRoot,
  ItemList: ProfileSectionItemList,
  Item: ProfileSectionItem,
  Button: ProfileSectionButton,
  ActionMenu: ProfileSectionActionMenu,
  ActionMenuItem: ProfileSectionActionMenuItem,
};

type SectionHeaderProps = PropsOfComponent<typeof Flex> & {
  localizationKey: LocalizationKey;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
};

export const SectionHeader = (props: SectionHeaderProps) => {
  const { textElementDescriptor, textElementId, localizationKey, ...rest } = props;
  return (
    <Flex {...rest}>
      <Text
        localizationKey={localizationKey}
        variant='subtitle'
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
      />
    </Flex>
  );
};
export const SectionSubHeader = (props: SectionHeaderProps) => {
  const { textElementDescriptor, textElementId, localizationKey, ...rest } = props;
  return (
    <Flex
      {...rest}
      sx={t => ({ padding: `${t.space.$2} ${t.space.$none}` })}
    >
      <Text
        localizationKey={localizationKey}
        colorScheme='neutral'
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
      />
    </Flex>
  );
};
