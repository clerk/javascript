import { Flex, localizationKeys, Text } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import type { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

type BackLinkProps = PropsOfComponent<typeof RouterLink> & {
  boxElementDescriptor?: ElementDescriptor;
  linkElementDescriptor?: ElementDescriptor;
};

export const BackLink = (props: BackLinkProps) => {
  const { boxElementDescriptor, linkElementDescriptor, ...rest } = props;
  return (
    <Flex
      elementDescriptor={boxElementDescriptor}
      sx={theme => ({ margin: `${theme.space.$none} auto` })}
    >
      <RouterLink {...rest}>
        <Text
          localizationKey={localizationKeys('backButton')}
          elementDescriptor={linkElementDescriptor}
          variant='body'
        />
      </RouterLink>
    </Flex>
  );
};
