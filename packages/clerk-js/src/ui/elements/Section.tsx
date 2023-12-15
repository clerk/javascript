import type { ProfileSectionId } from '@clerk/types';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import type { PropsOfComponent } from '../styledSystem';

type ProfileSectionProps = Omit<PropsOfComponent<typeof Flex>, 'title'> & {
  title: LocalizationKey;
  subtitle?: LocalizationKey;
  id: ProfileSectionId;
};

const ProfileSectionRoot = (props: ProfileSectionProps) => {
  const { title, children, id, subtitle, sx, ...rest } = props;
  return (
    <Col
      sx={[
        t => ({
          borderTop: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
          padding: `${t.space.$4} 0`,
          gap: t.space.$4,
        }),
        sx,
      ]}
      {...rest}
    >
      <SectionHeader
        localizationKey={title}
        elementDescriptor={descriptors.profileSectionTitle}
        elementId={descriptors.profileSectionTitle.setId(id)}
        textElementDescriptor={descriptors.profileSectionTitleText}
        textElementId={descriptors.profileSectionTitleText.setId(id)}
      />
      <Flex
        align='center'
        elementDescriptor={descriptors.profileSection}
        elementId={descriptors.profileSection.setId(id)}
        gap={2}
      >
        {subtitle && (
          <SectionSubHeader
            localizationKey={subtitle}
            elementDescriptor={descriptors.profileSectionSubtitle}
            elementId={descriptors.profileSectionSubtitle.setId(id)}
            textElementDescriptor={descriptors.profileSectionSubtitleText}
            textElementId={descriptors.profileSectionSubtitleText.setId(id)}
          />
        )}
        <Col
          elementDescriptor={descriptors.profileSectionContent}
          elementId={descriptors.profileSectionContent.setId(id)}
          gap={2}
          sx={{ width: '100%' }}
        >
          {children}
        </Col>
      </Flex>
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
      sx={t => ({ justifyContent: 'space-between', alignItems: 'center', padding: `${t.space.$0x5} ${t.space.$4}` })}
      {...rest}
    >
      {children}
    </Flex>
  );
};

type ProfileSectionButtonProps = PropsOfComponent<typeof Button> & {
  id: ProfileSectionId;
};

const ProfileSectionButton = (props: ProfileSectionButtonProps) => {
  const { children, id, sx, ...rest } = props;
  return (
    <Button
      elementDescriptor={descriptors.profileSectionPrimaryButton}
      elementId={descriptors.profileSectionPrimaryButton.setId(id)}
      variant='ghost'
      sx={[t => ({ justifyContent: 'start', padding: `${t.space.$1} ${t.space.$4}` }), sx]}
      {...rest}
    >
      {children}
    </Button>
  );
};

export const ProfileSection = {
  Root: ProfileSectionRoot,
  ItemList: ProfileSectionItemList,
  Item: ProfileSectionItem,
  Button: ProfileSectionButton,
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
        variant='h3'
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
