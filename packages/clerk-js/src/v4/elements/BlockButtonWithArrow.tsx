import React from 'react';

import { BlockButtonIcon, Icon, Text } from '../customizables';
import { ArrowRightIcon } from '../icons';
import { PropsOfComponent } from '../styledSystem';

type BlockButtonWithArrowProps = Omit<PropsOfComponent<typeof BlockButtonIcon>, 'rightIcon'> & {
  icon?: React.ReactElement;
};

export const BlockButtonWithArrow = (props: BlockButtonWithArrowProps) => {
  const { children, icon, ...rest } = props;
  return (
    <BlockButtonIcon
      {...rest}
      leftIcon={icon}
      rightIcon={
        // TODO should this be general block button arrows?
        <Icon
          // elementDescriptor={descriptors.socialButtonsButtonBlockArrow}
          // elementId={descriptors.socialButtonsButtonBlockArrow.setId(id)}
          icon={ArrowRightIcon}
        />
      }
    >
      <Text
        // elementDescriptor={descriptors.socialButtonsButtonBlockText}
        // elementId={descriptors.socialButtonsButtonBlockText.setId(id)}
        as='span'
        sx={{ width: '100%', textAlign: 'left' }}
        truncate
        variant='link'
      >
        {children}
      </Text>
    </BlockButtonIcon>
  );
};
