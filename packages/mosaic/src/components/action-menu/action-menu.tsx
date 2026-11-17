import { type Ref, useState } from 'react';

import { useSpinDelay } from '../../hooks/use-spin-delay';
import type { IconComponent } from '../../icons/glyph';
import { Icon } from '../icon';
import { Menu } from '../menu';
import { Spinner } from '../spinner';

export interface ActionMenuAction {
  label: string;
  color?: 'neutral' | 'negative';
  icon?: IconComponent;
  onClick: () => void;
  status?: 'idle' | 'pending';
}

export interface ActionMenuProps {
  label: string;
  actions: ActionMenuAction[];
  triggerRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
}

export function ActionMenu({ label, actions, triggerRef, disabled, focusableWhenDisabled }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const pending = actions.some(action => action.status === 'pending');
  const showSpinner = useSpinDelay(pending ? true : null, { minDuration: 0 });

  if (activated && !pending) {
    setActivated(false);
    setOpen(false);
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <Menu.Root
      placement='bottom-end'
      open={open}
      onOpenChange={nextOpen => {
        if (!pending) {
          setOpen(nextOpen);
        }
      }}
    >
      <Menu.Trigger
        ref={triggerRef}
        aria-label={label}
        disabled={disabled}
        focusableWhenDisabled={focusableWhenDisabled}
      />
      <Menu.Popup>
        {actions.map(action => (
          <Menu.Item
            key={action.label}
            color={action.color}
            label={action.label}
            onClick={() => {
              if (action.status !== undefined) {
                setActivated(true);
              }
              action.onClick();
            }}
            closeOnClick={action.status === undefined}
            aria-busy={action.status === 'pending' || undefined}
            disabled={disabled || pending}
          >
            {action.icon ? (
              <Menu.Media>
                <Icon glyph={action.icon} />
              </Menu.Media>
            ) : null}
            <Menu.Label>{action.label}</Menu.Label>
            {action.status !== undefined ? (
              <Menu.Indicator>
                {action.status === 'pending' && showSpinner ? (
                  <Spinner
                    size='sm'
                    label={action.label}
                  />
                ) : null}
              </Menu.Indicator>
            ) : null}
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  );
}
