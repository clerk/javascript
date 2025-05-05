import React, { forwardRef, useId, useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Text } from '../customizables';
import { common } from '../styledSystem';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  label?: string | LocalizationKey;
}

export const Switch = forwardRef<HTMLDivElement, SwitchProps>(
  ({ checked: controlledChecked, defaultChecked, onChange, disabled = false, 'aria-label': ariaLabel, label }, ref) => {
    const [internalChecked, setInternalChecked] = useState(!!defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;
    const labelId = useId();

    const handleToggle = (_: React.MouseEvent | React.KeyboardEvent) => {
      if (disabled) return;
      if (!isControlled) {
        setInternalChecked(!checked);
      }
      onChange?.(!checked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggle(e);
      }
    };

    return (
      <Flex
        direction='row'
        align='center'
        as='div'
      >
        <Flex
          as='div'
          ref={ref}
          tabIndex={disabled ? -1 : 0}
          role='switch'
          aria-checked={checked}
          aria-label={ariaLabel}
          aria-labelledby={label && !ariaLabel ? labelId : undefined}
          elementDescriptor={descriptors.switchRoot}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          sx={t => ({
            width: t.sizes.$6,
            height: t.sizes.$4,
            alignItems: 'center',
            position: 'relative',
            backgroundColor: checked ? t.colors.$primary500 : t.colors.$neutralAlpha150,
            borderRadius: 999,
            transition: 'background-color 0.2s',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.06) inset',
            ...common.focusRing(t),
          })}
        >
          <Flex
            as='span'
            elementDescriptor={descriptors.switchThumb}
            sx={t => ({
              position: 'absolute',
              left: t.sizes.$0x5,
              width: t.sizes.$3,
              height: t.sizes.$3,
              borderRadius: '50%',
              backgroundColor: t.colors.$colorBackground,
              boxShadow: t.shadows.$switchControl,
              transform: `translateX(${checked ? t.sizes.$2 : 0})`,
              transition: 'transform 0.2s',
              zIndex: 1,
            })}
          />
        </Flex>
        {label && (
          <Text
            id={labelId}
            variant='caption'
            colorScheme='secondary'
            localizationKey={label}
            sx={{
              marginLeft: 8,
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
            }}
          />
        )}
      </Flex>
    );
  },
);

Switch.displayName = 'Switch';
