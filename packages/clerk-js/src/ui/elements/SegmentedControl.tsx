import React, { createContext, useContext, useState } from 'react';

import { Box, descriptors, Flex, SimpleButton } from '../customizables';

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

type RootProps = {
  children: React.ReactNode;
  'aria-label': string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

type ButtonProps = {
  children: React.ReactNode;
  value: string;
};

function Root({ children, value: controlledValue, defaultValue, onChange, 'aria-label': ariaLabel }: RootProps) {
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
      <Flex
        elementDescriptor={descriptors.segmentedControlRoot}
        as='ul'
        aria-label={ariaLabel}
        sx={t => ({
          backgroundColor: t.colors.$neutralAlpha50,
          borderRadius: t.radii.$md,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$neutralAlpha100,
        })}
      >
        {React.Children.map(children, (child, index) => (
          <Box
            elementDescriptor={descriptors.segmentedControlItem}
            key={index}
            as='li'
            sx={{
              display: 'flex',
            }}
          >
            {child}
          </Box>
        ))}
      </Flex>
    </SegmentedControlContext.Provider>
  );
}

function Button({ children, value }: ButtonProps) {
  const { currentValue, onValueChange } = useSegmentedControlContext();
  const isSelected = value === currentValue;

  return (
    <SimpleButton
      elementDescriptor={descriptors.segmentedControlButton}
      variant='unstyled'
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      sx={t => ({
        padding: `${t.space.$1} ${t.space.$2x5}`,
        backgroundColor: isSelected ? t.colors.$colorBackground : 'transparent',
        color: isSelected ? t.colors.$colorText : t.colors.$colorTextSecondary,
        fontSize: t.fontSizes.$xs,
        minHeight: t.sizes.$6,
      })}
    >
      {children}
    </SimpleButton>
  );
}

export const SegmentedControl = {
  Root,
  Button,
};
