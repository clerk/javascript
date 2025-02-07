import type { MenuId } from '@clerk/types';

import type { LocalizationKey } from '../customizables';
import { Button, descriptors, Icon } from '../customizables';
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
      <MenuTrigger arialLabel={isOpen => `${isOpen ? 'Close' : 'Open'} menu`}>
        <Button
          sx={t => ({
            padding: t.space.$0x5,
            boxSizing: 'content-box',
            opacity: t.opacity.$inactive,
            ':hover': {
              opacity: 1,
            },
          })}
          variant='ghost'
          colorScheme='neutral'
          elementDescriptor={[descriptors.menuButton, descriptors.menuButtonMoreOptions]}
        >
          <Icon
            icon={ThreeDots}
            sx={t => ({ width: 'auto', height: t.sizes.$5 })}
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
