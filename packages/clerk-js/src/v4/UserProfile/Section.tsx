import { ProfileSectionId } from '@clerk/types';

import { Col, descriptors, Flex, Text } from '../customizables';
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
      <Flex
        elementDescriptor={descriptors.profileSectionTitle}
        elementId={descriptors.profileSectionTitle.setId(id)}
        sx={theme => ({ borderBottom: `${theme.borders.$normal} ${theme.colors.$blackAlpha100}` })}
      >
        <Text
          variant='largeMedium'
          elementDescriptor={descriptors.profileSectionTitleText}
          elementId={descriptors.profileSectionTitleText.setId(id)}
        >
          {title}
        </Text>
      </Flex>
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
