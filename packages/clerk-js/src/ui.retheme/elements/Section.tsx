import type { ProfileSectionId } from '@clerk/types';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Flex, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import type { PropsOfComponent } from '../styledSystem';

type ProfileSectionProps = Omit<PropsOfComponent<typeof Flex>, 'title'> & {
  title: LocalizationKey;
  subtitle?: LocalizationKey;
  id: ProfileSectionId;
};

export const ProfileSection = (props: ProfileSectionProps) => {
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
