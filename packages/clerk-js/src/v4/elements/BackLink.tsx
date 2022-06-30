import React from 'react';

import { Flex, Icon } from '../customizables';
import { ArrowLeftIcon } from '../icons';
import { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

type BackLinkProps = PropsOfComponent<typeof RouterLink>;

export const BackLink = (props: BackLinkProps) => {
  return (
    <Flex sx={theme => ({ marginBottom: theme.space.$2x5 })}>
      <RouterLink {...props}>
        <Icon icon={ArrowLeftIcon} />
        Back
      </RouterLink>
    </Flex>
  );
};
