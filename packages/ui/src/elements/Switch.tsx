import React, { forwardRef, useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Text } from '../customizables';
import { common } from '../styledSystem';

interface SwitchProps {
  id?: string;
  isChecked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  isDisabled?: boolean;
  label?: string | LocalizationKey;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const Switch = forwardRef<HTMLDivElement, SwitchProps>(
  (
    {
      id,
      isChecked: controlledChecked,
      defaultChecked,
      onChange,
      isDisabled = false,
      label,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(!!defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) {
        return;
      }
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e.target.checked);
    };

    const hasInternalLabel = label !== undefined;

    return (
      <Flex
        ref={ref}
        elementDescriptor={descriptors.switchRoot}
        direction='row'
        align='center'
        as='label'
        sx={t => ({
          position: 'relative',
          isolation: 'isolate',
          width: 'fit-content',
          '&:has(input:focus-visible) > input + span': {
            ...common.focusRingStyles(t),
          },
        })}
      >
        {/* The order of the elements is important here for the focus ring to work. The input is visually hidden, so the focus ring is applied to the span. */}
        <input
          id={id}
          type='checkbox'
          role='switch'
          disabled={isDisabled}
          defaultChecked={defaultChecked}
          checked={checked}
          onChange={handleChange}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          style={{
            ...common.visuallyHidden(),
            inset: 0,
          }}
        />
        <Flex
          elementDescriptor={descriptors.switchIndicator}
          as='span'
          data-checked={checked}
          sx={t => ({
            width: t.sizes.$6,
            height: t.sizes.$4,
            alignItems: 'center',
            position: 'relative',
            backgroundColor: checked ? t.colors.$primary500 : t.colors.$neutralAlpha150,
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
              // eslint-disable-next-line custom-rules/no-physical-css-properties -- Physical control - thumb uses translateX animation
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
        {hasInternalLabel ? (
          <Text
            as='span'
            variant='caption'
            colorScheme='secondary'
            localizationKey={label}
            sx={t => ({
              paddingInlineStart: t.sizes.$2,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
            })}
          />
        ) : null}
      </Flex>
    );
  },
);

Switch.displayName = 'Switch';
