import { Flex, Icon, localizationKeys, Text } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import { ArrowLeftIcon } from '../icons';
import type { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

type BackLinkProps = PropsOfComponent<typeof RouterLink> & {
  boxElementDescriptor?: ElementDescriptor;
  linkElementDescriptor?: ElementDescriptor;
  iconElementDescriptor?: ElementDescriptor;
};

export const BackLink = (props: BackLinkProps) => {
  const { boxElementDescriptor, linkElementDescriptor, iconElementDescriptor, ...rest } = props;
  return (
    <Flex
      elementDescriptor={boxElementDescriptor}
      sx={theme => ({ marginBottom: theme.space.$2x5 })}
    >
      <RouterLink {...rest}>
        <Icon
          elementDescriptor={iconElementDescriptor}
          icon={ArrowLeftIcon}
        />
        <Text
          localizationKey={localizationKeys('backButton')}
          elementDescriptor={linkElementDescriptor}
          colorScheme='inherit'
        />
      </RouterLink>
    </Flex>
  );
};
