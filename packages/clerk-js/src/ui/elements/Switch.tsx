import React, { forwardRef, useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Text } from '../customizables';
import { common } from '../styledSystem/common';

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span style={{ ...common.visuallyHidden() }}>{children}</span>
);

interface SwitchProps {
  /**
   * Whether the Switch should be selected (uncontrolled).
   */
  defaultSelected?: boolean;
  /**
   * 	Whether the Switch should be selected (controlled).
   */
  isSelected?: boolean;
  /**
   * Fired when the user presses the switch, and receives the new state.
   */
  onChange?: (isSelected: boolean) => void;
  /**
   * The label of the switch.
   */
  label: string | LocalizationKey;
  /**
   * Whether the input is disabled.
   */
  isDisabled?: boolean;
}

export const Switch = forwardRef<HTMLDivElement, SwitchProps>(
  ({ defaultSelected, isSelected: controlledSelected, onChange, label, isDisabled = false }, ref) => {
    const [internalSelected, setInternalSelected] = useState(!!defaultSelected);
    const isControlled = controlledSelected !== undefined;
    const isSelected = isControlled ? controlledSelected : internalSelected;

    const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();

      if (isDisabled) return;
      if (!isControlled) {
        setInternalSelected(!isSelected);
      }
      onChange?.(!isSelected);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        handleToggle(e);
      }
    };

    return (
      <Flex
        as='label'
        ref={ref}
        elementDescriptor={descriptors.switchRoot}
        data-selected={isSelected}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <input
            type='checkbox'
            role='switch'
            disabled={isDisabled}
            tabIndex={isDisabled ? -1 : 0}
          />
        </VisuallyHidden>
        <Flex
          as='div'
          align='center'
          sx={t => ({
            width: 24,
            height: 16,
            alignItems: 'center',
            position: 'relative',
            backgroundColor: isSelected ? t.colors.$primary500 : t.colors.$neutralAlpha150,
            borderRadius: 999,
            transition: 'background-color 0.2s',
            opacity: isDisabled ? 0.6 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
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
              left: isSelected ? 10 : 2,
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
        <Text
          localizationKey={label}
          variant='caption'
          colorScheme='secondary'
          sx={{
            marginLeft: 8,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        />
      </Flex>
    );
  },
);

Switch.displayName = 'Switch';
