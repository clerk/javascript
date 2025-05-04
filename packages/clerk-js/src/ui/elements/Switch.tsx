import React, { forwardRef, useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Text } from '../customizables';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  title?: string | LocalizationKey;
}

export const Switch = forwardRef<HTMLDivElement, SwitchProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked,
      onChange,
      disabled = false,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      title,
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(!!defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

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
        ref={ref}
        tabIndex={disabled ? -1 : 0}
        role='switch'
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        elementDescriptor={descriptors.switchRoot}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        sx={{
          width: 'fit-content',
          userSelect: 'none',
        }}
      >
        <Flex
          as='div'
          align='center'
          sx={t => ({
            width: 24,
            height: 16,
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
          })}
        >
          <Flex
            as='span'
            elementDescriptor={descriptors.switchThumb}
            sx={t => ({
              position: 'absolute',
              left: checked ? 10 : 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: t.colors.$colorBackground,
              boxShadow: t.shadows.$switchControl,
              transition: 'left 0.2s',
              zIndex: 1,
            })}
          />
        </Flex>
        {title && (
          <Text
            variant='caption'
            colorScheme='secondary'
            localizationKey={title}
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
