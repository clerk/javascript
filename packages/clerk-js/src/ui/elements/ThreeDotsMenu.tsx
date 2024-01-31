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
            width: t.sizes.$5,
            height: t.sizes.$5,
            padding: 0,
            opacity: t.opacity.$inactive,
            ':hover': {
              opacity: 1,
            },
          })}
          variant='ghost'
        >
          <Icon
            icon={ThreeDots}
            sx={t => ({ width: 'auto', height: t.sizes.$4 })}
          />
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
