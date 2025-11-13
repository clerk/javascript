import type { MenuId } from '@clerk/shared/types';

import type { LocalizationKey } from '../customizables';
import { Button, descriptors, Icon } from '../customizables';
import type { InternalTheme } from '../foundations';
import { ThreeDots } from '../icons';
import { Menu, MenuItem, MenuList, MenuTrigger } from './Menu';

type Action = {
  label: LocalizationKey;
  isDestructive?: boolean;
  onClick: () => unknown;
  isDisabled?: boolean;
};

type ThreeDotsMenuProps = {
  variant?: 'bordered';
  actions: Action[];
  elementId?: MenuId;
};

export const ThreeDotsMenu = (props: ThreeDotsMenuProps) => {
  const { actions, elementId, variant } = props;
  const isBordered = variant === 'bordered';

  const iconSx = (t: InternalTheme) =>
    !isBordered
      ? { width: 'auto', height: t.sizes.$5 }
      : { width: t.sizes.$4, height: t.sizes.$4, opacity: t.opacity.$inactive };

  const buttonVariant = isBordered ? 'bordered' : 'ghost';
  const colorScheme = isBordered ? 'secondary' : 'neutral';

  return (
    <Menu elementId={elementId}>
      <MenuTrigger arialLabel={isOpen => `${isOpen ? 'Close' : 'Open'} menu`}>
        <Button
          sx={t =>
            !isBordered
              ? {
                  padding: t.space.$0x5,
                  boxSizing: 'content-box',
                  opacity: t.opacity.$inactive,
                  ':hover,:focus-visible': {
                    opacity: 1,
                  },
                }
              : {
                  width: t.sizes.$6,
                  height: t.sizes.$6,
                }
          }
          variant={buttonVariant}
          colorScheme={colorScheme}
          elementDescriptor={[
            descriptors.menuButton,
            isBordered ? descriptors.menuButtonEllipsisBordered : descriptors.menuButtonEllipsis,
          ]}
        >
          <Icon
            icon={ThreeDots}
            sx={iconSx}
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
