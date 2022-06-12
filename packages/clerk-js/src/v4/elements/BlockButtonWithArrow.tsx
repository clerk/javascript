import React from 'react';

import { BlockButtonIcon, Flex, Icon } from '../customizables';
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
      <Flex
        // elementDescriptor={descriptors.socialButtonsButtonBlockText}
        // elementId={descriptors.socialButtonsButtonBlockText.setId(id)}
        as='span'
        sx={{ width: '100%' }}
      >
        {children}
      </Flex>
    </BlockButtonIcon>
  );
};
