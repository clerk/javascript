import type { CardActionId } from '@clerk/shared/types';
import React from 'react';

import { descriptors, Flex, Text } from '../../customizables';
import type { PropsOfComponent } from '../../styledSystem';
import { RouterLink } from '../RouterLink';

type CardActionProps = Omit<PropsOfComponent<typeof Flex>, 'elementId'> & {
  elementId?: CardActionId;
};
export const CardAction = (props: CardActionProps): JSX.Element => {
  const { elementId, sx, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.footerAction}
      elementId={descriptors.footerAction.setId(elementId)}
      {...rest}
      gap={1}
      sx={[
        t => ({
          margin: `${t.space.$none} auto`,
        }),
        sx,
      ]}
    />
  );
};

export const CardActionText = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      elementDescriptor={descriptors.footerActionText}
      {...props}
      as='span'
      variant='body'
      colorScheme='secondary'
    />
  );
};

export const CardActionLink = (props: PropsOfComponent<typeof RouterLink>): JSX.Element => {
  return (
    <RouterLink
      elementDescriptor={descriptors.footerActionLink}
      {...props}
      colorScheme='primary'
      variant='buttonLarge'
    />
  );
};
