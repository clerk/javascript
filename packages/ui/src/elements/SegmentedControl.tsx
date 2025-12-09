import { Composite, CompositeItem } from '@floating-ui/react';
import React, { createContext, useContext, useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, SimpleButton } from '../customizables';
import type { ThemableCssProp } from '../styledSystem';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl Context
 * -----------------------------------------------------------------------------------------------*/

type SegmentedControlSize = 'md' | 'lg';

type SegmentedControlContextType = {
  currentValue: string | undefined;
  onValueChange: (value: string) => void;
  size: SegmentedControlSize;
  fullWidth: boolean;
};

const SegmentedControlContext = createContext<SegmentedControlContextType | null>(null);

function useSegmentedControlContext() {
  const context = useContext(SegmentedControlContext);
  if (!context) {
    throw new Error('SegmentedControl.Button must be used within SegmentedControl.Root');
  }
  return context;
}

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Root
 * -----------------------------------------------------------------------------------------------*/

interface RootProps {
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  sx?: ThemableCssProp;
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  (
    {
      children,
      value: controlledValue,
      defaultValue,
      onChange,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      size = 'md',
      fullWidth = false,
      sx,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    return (
      <SegmentedControlContext.Provider value={{ currentValue, onValueChange: handleValueChange, size, fullWidth }}>
        <Composite
          orientation='horizontal'
          role='radiogroup'
          loop={false}
          render={
            <Flex
              ref={ref}
              elementDescriptor={descriptors.segmentedControlRoot}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledby}
              sx={[
                t => ({
                  backgroundColor: t.colors.$neutralAlpha50,
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$solid,
                  borderColor: t.colors.$borderAlpha100,
                  isolation: 'isolate',
                }),
                sx,
              ]}
            />
          }
        >
          {children}
        </Composite>
      </SegmentedControlContext.Provider>
    );
  },
);

Root.displayName = 'SegmentedControl.Root';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Button
 * -----------------------------------------------------------------------------------------------*/

interface ButtonProps {
  text: string | LocalizationKey;
  value: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ text, value }, ref) => {
  const { currentValue, onValueChange, size, fullWidth } = useSegmentedControlContext();
  const isSelected = value === currentValue;

  return (
    <CompositeItem
      render={compProps => {
        return (
          <SimpleButton
            ref={ref}
            {...compProps}
            localizationKey={text}
            elementDescriptor={descriptors.segmentedControlButton}
            variant='unstyled'
            role='radio'
            aria-checked={isSelected}
            onClick={() => onValueChange(value)}
            isActive={isSelected}
            sx={t => ({
              position: 'relative',
              width: fullWidth ? '100%' : 'auto',
              backgroundColor: isSelected ? t.colors.$colorBackground : 'transparent',
              color: isSelected ? t.colors.$colorForeground : t.colors.$colorMutedForeground,
              fontSize: size === 'lg' ? t.fontSizes.$md : t.fontSizes.$xs,
              minHeight: t.sizes.$6,
              boxShadow: isSelected ? t.shadows.$segmentedControl : 'none',
              borderRadius: `calc(${t.radii.$md} - ${t.borderWidths.$normal})`,
              zIndex: 1,
              ':focus-visible': {
                zIndex: 2,
              },
            })}
          />
        );
      }}
    />
  );
});

Button.displayName = 'SegmentedControl.Button';

export const SegmentedControl = {
  Root,
  Button,
};
