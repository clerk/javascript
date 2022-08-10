import React from 'react';

import { Flex, Icon } from '../customizables';
import { ElementDescriptor } from '../customizables/elementDescriptors';
import { ArrowLeftIcon } from '../icons';
import { PropsOfComponent } from '../styledSystem';
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
      <RouterLink
        elementDescriptor={linkElementDescriptor}
        {...rest}
      >
        <Icon
          elementDescriptor={iconElementDescriptor}
          icon={ArrowLeftIcon}
        />
        Back
      </RouterLink>
    </Flex>
  );
};
