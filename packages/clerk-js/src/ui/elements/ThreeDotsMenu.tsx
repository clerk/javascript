import React from 'react';

import { Button, Icon } from '../customizables';
import { ThreeDots } from '../icons';
import { Menu, MenuItem, MenuList, MenuTrigger } from './Menu';

type Action = { label: string; isDestructive?: boolean; onClick: () => unknown; isDisabled?: boolean };

type ThreeDotsMenuProps = {
  actions: Action[];
};

export const ThreeDotsMenu = (props: ThreeDotsMenuProps) => {
  const { actions } = props;
  return (
    <Menu>
      <MenuTrigger>
        <Button
          size='xs'
          sx={t => ({
            opacity: t.opacity.$inactive,
            ':hover': {
              opacity: 1,
            },
          })}
          colorScheme='neutral'
          variant='ghost'
        >
          <Icon icon={ThreeDots} />
        </Button>
      </MenuTrigger>
      <MenuList>
        {actions.map(a => (
          <MenuItem
            key={a.label}
            destructive={a.isDestructive}
            onClick={a.onClick}
            isDisabled={a.isDisabled}
          >
            {a.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
