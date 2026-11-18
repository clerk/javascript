import type { ComponentDoc } from '../../docs-schema';
import type {
  TabsIndicatorProps,
  TabsListProps,
  TabsPanelProps,
  TabsProps,
  TabsTabProps,
  TabsTriggerProps,
} from './parts';

export default {
  name: 'Tabs',
  description:
    'Headless, unstyled tabs: a `tablist` of tabs that each show one panel. Arrow keys move between tabs, and focus selects a tab unless `activationMode` is `manual`. A hidden panel unmounts its children after its exit animation.',
  useFor: [
    'switching between views in the same area of a page',
    'parallel sections of settings shown one at a time',
    'tabbed content with a sliding selection indicator',
  ],
  keywords: ['tabs', 'tablist', 'tabpanel', 'tab bar', 'views', 'switcher', 'indicator'],
  practices: [
    { do: true, text: 'Give each `Tabs.Panel` the `value` of its tab. The tab and panel ids are paired from it.' },
    {
      do: true,
      text: 'Pass `keepMounted` to a panel whose state must survive being hidden. Its children unmount otherwise.',
    },
    {
      do: true,
      text: 'Slide panels with `--cl-tab-transition-direction`, and the indicator with `data-direction`.',
    },
    { do: false, text: 'Pass `id` to a tab or panel. The primitive owns it and drops yours.' },
    {
      do: false,
      text: 'Put `Tabs.Trigger` in `Tabs.List`. Use `Tabs.Tab` there; `Tabs.Trigger` is for a button outside the list and has no arrow-key navigation.',
    },
    { do: false, text: 'Use it for a choice that does not own a panel. Use `SegmentedControl` instead.' },
  ],
  parts: {
    'Tabs.Root': {
      description: 'Holds the selected tab and the direction it last moved. Renders no element.',
      props: {
        value: { type: 'string', doc: 'The selected tab, when controlled.' },
        defaultValue: { type: 'string', doc: 'The selected tab on mount, when uncontrolled.', default: "''" },
        onValueChange: {
          type: '(value: string) => void',
          doc: 'Called with the new tab value. Not called when the same tab is chosen again.',
        },
        orientation: {
          type: "'horizontal' | 'vertical'",
          doc: 'Which arrow keys move between tabs.',
          default: "'horizontal'",
        },
        activationMode: {
          type: "'automatic' | 'manual'",
          doc: 'Whether focusing a tab selects it, or `Enter`, `Space` or a click must.',
          default: "'automatic'",
        },
      },
    },
    'Tabs.List': {
      description: 'A `div` with `role="tablist"` and `aria-orientation`, with one tab stop and arrow-key navigation.',
    },
    'Tabs.Tab': {
      description:
        'A `button` with `role="tab"`, `aria-selected` and `aria-controls`, inside `Tabs.List`. Carries `data-selected` and `data-disabled`.',
      props: {
        value: { type: 'string', doc: 'Identifies the tab. Matches a `Tabs.Panel` value.' },
        disabled: { type: 'boolean', doc: 'Sets `disabled` and `aria-disabled`, and blocks selection.' },
      },
    },
    'Tabs.Trigger': {
      description:
        'A standalone `button` with `role="tab"` that selects its tab on click, for use outside `Tabs.List`, such as in a sidebar. Carries `data-selected` and `data-disabled`.',
      props: {
        value: { type: 'string', doc: 'Identifies the tab. Matches a `Tabs.Panel` value.' },
        disabled: { type: 'boolean', doc: 'Sets `aria-disabled` and blocks selection. The trigger stays focusable.' },
      },
    },
    'Tabs.Panel': {
      description:
        'A `div` with `role="tabpanel"`, labelled by its tab. Carries `data-hidden`, `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`, and `--cl-tab-transition-direction`. A leaving panel is `inert` and its children freeze. The first selected panel shows without an enter animation.',
      props: {
        value: { type: 'string', doc: 'The tab value that shows this panel.' },
        keepMounted: { type: 'boolean', doc: 'Renders the children while the panel is hidden.' },
      },
    },
    'Tabs.Indicator': {
      description:
        'A decorative `span`, `aria-hidden`, for the selection highlight. Carries `data-direction`. Position it with CSS anchor positioning.',
    },
  },
  examples: [
    {
      title: 'Tabs with an indicator',
      code: `
<Tabs.Root defaultValue='account'>
  <Tabs.List>
    <Tabs.Tab value='account'>Account</Tabs.Tab>
    <Tabs.Tab value='security'>Security</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value='account'>Account settings</Tabs.Panel>
  <Tabs.Panel value='security'>Security settings</Tabs.Panel>
</Tabs.Root>
`,
    },
  ],
  related: ['SegmentedControl', 'Accordion'],
} satisfies ComponentDoc<{
  'Tabs.Root': TabsProps;
  'Tabs.List': TabsListProps;
  'Tabs.Tab': TabsTabProps;
  'Tabs.Trigger': TabsTriggerProps;
  'Tabs.Panel': TabsPanelProps;
  'Tabs.Indicator': TabsIndicatorProps;
}>;
