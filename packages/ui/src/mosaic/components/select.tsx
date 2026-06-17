import React from 'react';
import type { ReactNode } from 'react';

import type { SelectPortalProps, SelectProps as HeadlessSelectProps } from '@clerk/headless/select';
import type { FunctionComponent } from 'react';

import { Select as Primitive } from '../primitives/select';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

export const selectRecipe = defineSlotRecipe(theme => ({
  slots: {
    positioner: { slot: 'select-positioner' },
    popup: { slot: 'select-popup' },
    option: { slot: 'select-option' },
  },
  base: {
    positioner: {
      zIndex: 50,
    },
    popup: {
      background: `light-dark(white, oklch(0.145 0 0))`,
      border: `1px solid ${theme.color.border}`,
      borderRadius: theme.rounded.md,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      minWidth: '140px',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      paddingBlock: theme.spacing(1.5),
      paddingInline: theme.spacing(2),
      borderRadius: theme.rounded.sm,
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      textAlign: 'left',
      ...theme.text('sm'),
      color: theme.color.primary,
      '&[data-cl-active]': { background: theme.color.muted },
      '&[data-cl-selected]': { fontWeight: theme.font.medium },
      '&[data-cl-disabled]': { opacity: 0.4, cursor: 'not-allowed' },
    },
  },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'select-positioner': true;
    'select-popup': true;
    'select-option': true;
  }
}

const Positioner = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Positioner>>(
  function SelectPositioner(props, ref) {
    const { positioner } = useRecipe(selectRecipe);
    return (
      <Primitive.Positioner
        ref={ref}
        {...props}
        {...positioner}
      />
    );
  },
);

const Popup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Popup>>(
  function SelectPopup(props, ref) {
    const { popup } = useRecipe(selectRecipe);
    return (
      <Primitive.Popup
        ref={ref}
        {...props}
        {...popup}
      />
    );
  },
);

const Option = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Primitive.Option>>(
  function SelectOption(props, ref) {
    const { option } = useRecipe(selectRecipe);
    return (
      <Primitive.Option
        ref={ref}
        {...props}
        {...option}
      />
    );
  },
);

interface SelectProps extends Pick<
  HeadlessSelectProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'open'
  | 'defaultOpen'
  | 'onOpenChange'
  | 'items'
  | 'placement'
  | 'sideOffset'
> {
  trigger: React.ComponentProps<typeof Primitive.Trigger>['render'];
  children: ReactNode;
}

export function Select({ trigger, children, ...rootProps }: SelectProps) {
  return (
    <Primitive.Root
      alignItemWithTrigger={false}
      {...rootProps}
    >
      <Primitive.Trigger render={trigger} />
      <Primitive.Portal>
        <Positioner>
          <Popup>{children}</Popup>
        </Positioner>
      </Primitive.Portal>
    </Primitive.Root>
  );
}

Select.Root = Primitive.Root;
Select.Trigger = Primitive.Trigger;
Select.Value = Primitive.Value;
Select.Portal = Primitive.Portal as FunctionComponent<SelectPortalProps>;
Select.Positioner = Positioner;
Select.Popup = Popup;
Select.Option = Option;
