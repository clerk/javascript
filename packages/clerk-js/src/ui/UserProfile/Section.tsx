import { ProfileSectionId } from '@clerk/types';

import { Col, descriptors, Flex, Text } from '../customizables';
import { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { PropsOfComponent } from '../styledSystem';

type ProfileSectionProps = PropsOfComponent<typeof Flex> & { title: string; id: ProfileSectionId };

export const ProfileSection = (props: ProfileSectionProps) => {
  const { title, children, id, ...rest } = props;
  return (
    <Col
      elementDescriptor={descriptors.profileSection}
      elementId={descriptors.profileSection.setId(id)}
      {...rest}
      gap={2}
    >
      <SectionHeader
        elementDescriptor={descriptors.profileSectionTitle}
        elementId={descriptors.profileSectionTitle.setId(id)}
        textElementDescriptor={descriptors.profileSectionTitleText}
        textElementId={descriptors.profileSectionTitleText.setId(id)}
      >
        {title}
      </SectionHeader>
      <Col
        elementDescriptor={descriptors.profileSectionContent}
        elementId={descriptors.profileSectionContent.setId(id)}
        gap={2}
      >
        {children}
      </Col>
    </Col>
  );
};

type SectionHeaderProps = PropsOfComponent<typeof Flex> & {
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
};

export const SectionHeader = (props: SectionHeaderProps) => {
  const { textElementDescriptor, textElementId, children, ...rest } = props;
  return (
    <Flex
      {...rest}
      sx={theme => ({ borderBottom: `${theme.borders.$normal} ${theme.colors.$blackAlpha100}` })}
    >
      <Text
        variant='largeMedium'
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
      >
        {children}
      </Text>
    </Flex>
  );
};
