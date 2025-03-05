import { Composite, CompositeItem } from '@floating-ui/react';
import React, { createContext, useContext, useState } from 'react';

import { descriptors, Flex, SimpleButton } from '../customizables';

type SegmentedControlContextType = {
  currentValue: string | undefined;
  onValueChange: (value: string) => void;
};

const SegmentedControlContext = createContext<SegmentedControlContextType | null>(null);

function useSegmentedControlContext() {
  const context = useContext(SegmentedControlContext);
  if (!context) {
    throw new Error('SegmentedControl.Button must be used within SegmentedControl.Root');
  }
  return context;
}

interface RootProps {
  children: React.ReactNode;
  'aria-label': string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  ({ children, value: controlledValue, defaultValue, onChange, 'aria-label': ariaLabel }, ref) => {
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
      <SegmentedControlContext.Provider value={{ currentValue, onValueChange: handleValueChange }}>
        <Composite
          orientation='horizontal'
          role='radiogroup'
          loop={false}
          render={
            <Flex
              ref={ref}
              elementDescriptor={descriptors.segmentedControlRoot}
              aria-label={ariaLabel}
              sx={t => ({
                backgroundColor: t.colors.$neutralAlpha50,
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$neutralAlpha100,
              })}
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

interface ButtonProps {
  children: React.ReactNode;
  value: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, value }, ref) => {
  const { currentValue, onValueChange } = useSegmentedControlContext();
  const isSelected = value === currentValue;

  return (
    <CompositeItem
      render={compProps => {
        return (
          <SimpleButton
            ref={ref}
            {...compProps}
            elementDescriptor={descriptors.segmentedControlButton}
            variant='unstyled'
            role='radio'
            aria-checked={isSelected}
            onClick={() => onValueChange(value)}
            sx={t => ({
              padding: `${t.space.$1} ${t.space.$2x5}`,
              backgroundColor: isSelected ? t.colors.$colorBackground : 'transparent',
              color: isSelected ? t.colors.$colorText : t.colors.$colorTextSecondary,
              fontSize: t.fontSizes.$xs,
              minHeight: t.sizes.$6,
              boxShadow: isSelected ? t.shadows.$segmentedControl : 'none',
              borderRadius: `calc(${t.radii.$md} - ${t.borderWidths.$normal})`,
            })}
          >
            {children}
          </SimpleButton>
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
