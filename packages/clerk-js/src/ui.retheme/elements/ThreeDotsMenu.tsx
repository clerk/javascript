import type { MenuId } from '@clerk/types';

import type { LocalizationKey } from '../customizables';
import { Button, Icon } from '../customizables';
import { ThreeDots } from '../icons';
import { Menu, MenuItem, MenuList, MenuTrigger } from './Menu';

type Action = {
  label: LocalizationKey;
  isDestructive?: boolean;
  onClick: () => unknown;
  isDisabled?: boolean;
};

type ThreeDotsMenuProps = {
  actions: Action[];
  elementId?: MenuId;
};

export const ThreeDotsMenu = (props: ThreeDotsMenuProps) => {
  const { actions, elementId } = props;
  return (
    <Menu elementId={elementId}>
      <MenuTrigger>
        <Button
          size='xs'
          sx={t => ({
            opacity: t.opacity.$inactive,
            ':hover': {
              opacity: 1,
            },
          })}
          variant='ghost'
        >
          <Icon icon={ThreeDots} />
        </Button>
      </MenuTrigger>
      <MenuList>
        {actions.map((a, index) => (
          <MenuItem
            key={index}
            destructive={a.isDestructive}
            onClick={a.onClick}
            isDisabled={a.isDisabled}
            localizationKey={a.label}
          />
        ))}
      </MenuList>
    </Menu>
  );
};
