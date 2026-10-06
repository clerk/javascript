import { descriptors, Icon, localizationKeys, SimpleButton, Text } from '../../customizables';
import { ChevronLeft } from '../../icons';

export const SecurityBackControl = ({ onClick }: { onClick: () => void }): JSX.Element => (
  <SimpleButton
    elementDescriptor={descriptors.configureSSOHeaderBackButton}
    variant='unstyled'
    onClick={onClick}
    sx={t => ({
      gap: t.space.$1,
      padding: 0,
      color: t.colors.$colorMutedForeground,
      '&:hover': { color: t.colors.$colorForeground },
    })}
  >
    <Icon icon={ChevronLeft} />
    <Text
      as='span'
      variant='body'
      localizationKey={localizationKeys('organizationProfile.navbar.security')}
    />
  </SimpleButton>
);
