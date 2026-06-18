import React from 'react';

import { Tabs as Primitive } from '../primitives/tabs';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

/**
 * One multi-slot recipe owns every tabs part: slot identity (`data-cl-slot`),
 * base styles, and the appearance cascade. Each exported part below reads its
 * own slot from `useRecipe(tabsRecipe)` and spreads it onto the bridged headless
 * primitive. The headless parts no longer emit `data-cl-slot` — slot identity is
 * applied here, in the styled layer.
 */
export const tabsRecipe = defineSlotRecipe(theme => ({
  slots: {
    list: { slot: 'tabs-list' },
    tab: { slot: 'tabs-tab' },
    trigger: { slot: 'tabs-trigger' },
    panel: { slot: 'tabs-panel' },
    indicator: { slot: 'tabs-indicator' },
  },
  base: {
    list: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(4),
      borderBottom: `1px solid ${theme.alpha('primary', 10)}`,
    },
    tab: {
      appearance: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      paddingInline: theme.spacing(1),
      paddingBlock: theme.spacing(2),
      ...theme.text('sm'),
      fontWeight: theme.font.medium,
      color: theme.color.mutedForeground,
      cursor: 'pointer',
      transition: 'color 150ms',
      '&[data-cl-selected]': {
        color: theme.color.primary,
      },
      '&[data-cl-disabled]': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    trigger: {
      appearance: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      paddingInline: theme.spacing(1),
      paddingBlock: theme.spacing(2),
      ...theme.text('sm'),
      fontWeight: theme.font.medium,
      color: theme.color.mutedForeground,
      cursor: 'pointer',
      transition: 'color 150ms',
      '&[data-cl-selected]': {
        color: theme.color.primary,
      },
      '&[data-cl-disabled]': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    panel: {
      paddingBlock: theme.spacing(4),
      '&[data-cl-hidden]': {
        display: 'none',
      },
    },
    // The headless indicator positions itself (`position`, `left`, `width`) via
    // inline style tracking the active tab; the recipe only supplies the visual
    // underline at the bottom of the list and the slide transition.
    indicator: {
      bottom: 0,
      height: '2px',
      backgroundColor: theme.color.primary,
      transition: 'left 150ms ease-out, width 150ms ease-out',
    },
  },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'tabs-list': true;
    'tabs-tab': true;
    'tabs-trigger': true;
    'tabs-panel': true;
    'tabs-indicator': true;
  }
}

const List = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.List>>(
  function TabsList(props, ref) {
    const { list } = useRecipe(tabsRecipe);
    return (
      <Primitive.List
        ref={ref}
        {...props}
        {...list}
      />
    );
  },
);

const Tab = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Primitive.Tab>>(
  function TabsTab(props, ref) {
    const { tab } = useRecipe(tabsRecipe);
    return (
      <Primitive.Tab
        ref={ref}
        {...props}
        {...tab}
      />
    );
  },
);

const Trigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Primitive.Trigger>>(
  function TabsTrigger(props, ref) {
    const { trigger } = useRecipe(tabsRecipe);
    return (
      <Primitive.Trigger
        ref={ref}
        {...props}
        {...trigger}
      />
    );
  },
);

const Panel = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Panel>>(
  function TabsPanel(props, ref) {
    const { panel } = useRecipe(tabsRecipe);
    return (
      <Primitive.Panel
        ref={ref}
        {...props}
        {...panel}
      />
    );
  },
);

const Indicator = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<typeof Primitive.Indicator>>(
  function TabsIndicator(props, ref) {
    const { indicator } = useRecipe(tabsRecipe);
    return (
      <Primitive.Indicator
        ref={ref}
        {...props}
        {...indicator}
      />
    );
  },
);

/** Styled mosaic Tabs components built on headless Tabs primitives. */
export const Tabs: {
  Root: typeof Primitive.Root;
  List: typeof List;
  Tab: typeof Tab;
  Trigger: typeof Trigger;
  Panel: typeof Panel;
  Indicator: typeof Indicator;
} = {
  Root: Primitive.Root,
  List,
  Tab,
  Trigger,
  Panel,
  Indicator,
};
