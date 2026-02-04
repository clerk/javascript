import type { ProfileSectionId } from '@clerk/shared/types';
import { forwardRef, isValidElement, useLayoutEffect, useRef, useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Icon, Spinner, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { Plus } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { mqu } from '../styledSystem';
import { Animated } from './Animated';
import { ArrowBlockButton } from './ArrowBlockButton';
import { Menu, MenuItem, MenuList, MenuTrigger } from './Menu';

type ProfileSectionProps = Omit<PropsOfComponent<typeof Flex>, 'title'> & {
  title: LocalizationKey;
  centered?: boolean;
  id: ProfileSectionId;
};

const ProfileSectionRoot = (props: ProfileSectionProps) => {
  const { title, centered = true, children, id, sx, ...rest } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element) {
      setHeight(element.clientHeight + element.clientTop || 0);
    }
  }, []);

  return (
    <Flex
      elementDescriptor={descriptors.profileSection}
      elementId={descriptors.profileSection.setId(id)}
      sx={[
        t => ({
          flexDirection: 'row-reverse',
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$borderAlpha100,
          paddingTop: t.space.$4,
          paddingBottom: t.space.$4,
          gap: t.space.$6,
          [mqu.lg]: {
            flexDirection: 'column-reverse',
            gap: t.space.$2,
          },
        }),
        sx,
      ]}
      {...rest}
    >
      <Col
        elementDescriptor={descriptors.profileSectionContent}
        elementId={descriptors.profileSectionContent.setId(id)}
        gap={2}
        ref={ref}
        sx={{
          minWidth: 0,
          width: '100%',
          '+ *': {
            '--clerk-height': `${height}px`,
          },
        }}
      >
        {children}
      </Col>

      <Col
        elementDescriptor={descriptors.profileSectionHeader}
        elementId={descriptors.profileSectionHeader.setId(id)}
        sx={t => ({
          padding: centered ? undefined : `${t.space.$1x5} 0`,
          gap: t.space.$1,
          width: t.space.$66,
          alignSelf: height ? 'self-start' : centered ? 'center' : undefined,
          marginTop: centered ? 'calc(var(--clerk-height)/2)' : undefined,
          transform: height && centered ? 'translateY(-50%)' : undefined,
          [mqu.lg]: {
            alignSelf: 'self-start',
            marginTop: 'unset',
            transform: 'none',
            padding: 0,
          },
        })}
      >
        <SectionHeader
          localizationKey={title}
          elementDescriptor={descriptors.profileSectionTitle}
          elementId={descriptors.profileSectionTitle.setId(id)}
          textElementDescriptor={descriptors.profileSectionTitleText}
          textElementId={descriptors.profileSectionTitleText.setId(id)}
        />
      </Col>
    </Flex>
  );
};

type ProfileSectionItemListProps = PropsOfComponent<typeof Col> & {
  id: ProfileSectionId;
  disableAnimation?: boolean;
};

const ProfileSectionItemList = (props: ProfileSectionItemListProps) => {
  const { children, id, disableAnimation = false, ...rest } = props;

  const componentBody = (
    <Col
      elementDescriptor={descriptors.profileSectionItemList}
      elementId={descriptors.profileSectionItemList.setId(id)}
      sx={t => ({
        gap: t.space.$0x5,
      })}
      {...rest}
    >
      {children}
    </Col>
  );

  if (disableAnimation) {
    return componentBody;
  }

  return <Animated asChild>{componentBody}</Animated>;
};

type ProfileSectionItemProps = Omit<PropsOfComponent<typeof Flex>, 'id'> & {
  id: ProfileSectionId;
  hoverable?: boolean;
};

const ProfileSectionItem = (props: ProfileSectionItemProps) => {
  const { children, id, sx, hoverable, ...rest } = props;

  return (
    <Flex
      elementDescriptor={descriptors.profileSectionItem}
      elementId={descriptors.profileSectionItem.setId(id)}
      sx={[
        t => ({
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          padding: `${t.space.$1} ${t.space.$1} ${t.space.$1} ${t.space.$2x5}`,
          gap: t.space.$2,
          ...(hoverable && {
            borderRadius: t.radii.$lg,
            ':hover': { backgroundColor: t.colors.$neutralAlpha50 },
          }),
        }),
        sx,
      ]}
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
  const { children, id, sx, ...rest } = props;
  return (
    <Button
      elementDescriptor={descriptors.profileSectionPrimaryButton}
      elementId={descriptors.profileSectionPrimaryButton.setId(id)}
      variant='ghost'
      sx={[
        t => ({
          whiteSpace: 'nowrap',
          justifyContent: 'start',
          gap: t.space.$2,
          padding: `${t.space.$1x5} ${t.space.$3} ${t.space.$1x5} ${t.space.$2x5}`,
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
    </Button>
  );
};

const ProfileSectionArrowButton = forwardRef<HTMLButtonElement, ProfileSectionButtonProps>((props, ref) => {
  const { children, leftIcon = Plus, id, sx, localizationKey, ...rest } = props;
  return (
    <ArrowBlockButton
      elementDescriptor={descriptors.profileSectionPrimaryButton}
      elementId={descriptors.profileSectionPrimaryButton.setId(id)}
      variant='ghost'
      sx={[
        t => ({
          textWrap: 'nowrap',
          justifyContent: 'start',
          height: t.sizes.$8,
        }),
        sx,
      ]}
      textLocalizationKey={localizationKey}
      leftIcon={leftIcon}
      leftIconSx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
      ref={ref}
      {...rest}
    >
      {children}
    </ArrowBlockButton>
  );
});

type ProfileSectionButtonGroupProps = PropsOfComponent<typeof Flex> & {
  id: ProfileSectionId;
  disableAnimation?: boolean;
};

const ProfileSectionButtonGroup = (props: ProfileSectionButtonGroupProps) => {
  const { children, id, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.profileSectionButtonGroup}
      elementId={descriptors.profileSectionButtonGroup.setId(id)}
      justify='between'
      gap={2}
      {...rest}
    >
      {children}
    </Flex>
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
          padding: `${theme.space.$1x5} ${theme.space.$2}`,
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
                  color: theme.colors.$neutralAlpha600,
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
  id: ProfileSectionId;
  onClick?: () => void;
};

export const ProfileSectionActionMenu = (props: ProfileSectionActionMenuProps) => {
  const { children, triggerLocalizationKey, id, triggerSx, onClick } = props;
  return (
    <Flex
      sx={{
        position: 'relative',
      }}
    >
      <Menu elementId={id}>
        <MenuTrigger>
          <ProfileSectionArrowButton
            id={id}
            textLocalizationKey={triggerLocalizationKey}
            sx={[
              t => ({
                justifyContent: 'start',
                height: t.sizes.$8,
              }),
              triggerSx,
            ]}
            leftIcon={Plus}
            leftIconSx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
            onClick={onClick}
          />
        </MenuTrigger>
        <MenuList
          asPortal={false}
          sx={t => ({
            width: '100%',
            padding: t.space.$1,
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
  ArrowButton: ProfileSectionArrowButton,
  ButtonGroup: ProfileSectionButtonGroup,
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
        colorScheme='secondary'
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
      />
    </Flex>
  );
};
