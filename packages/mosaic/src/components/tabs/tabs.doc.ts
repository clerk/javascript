import type { ComponentDoc } from '../../docs-schema';
import type {
  TabsListProps,
  TabsPanelProps,
  TabsPanelsProps,
  TabsRootProps,
  TabsTabProps,
  TabsTriggerProps,
} from './tabs';

export default {
  name: 'Tabs',
  description:
    'Horizontal tabs that switch between panels, with a sliding indicator under the selected tab. The arrow keys move between tabs. A hidden panel unmounts its children once its exit animation ends.',
  useFor: [
    'switching between panels of content on one page',
    'a tab bar, such as Members and Invitations',
    'a tab button outside the tab list, such as in a sidebar',
  ],
  keywords: ['tabs', 'tab bar', 'tablist', 'tabpanel', 'panels', 'navigation'],
  practices: [
    { do: true, text: 'Wrap the panels in `Tabs.Panels` so they share one grid cell and can animate in and out.' },
    { do: true, text: 'Pass `keepMounted` to a panel whose state must survive being hidden.' },
    {
      do: false,
      text: 'Pass `orientation`. The styled tabs are horizontal only; the headless primitive supports vertical.',
    },
    { do: false, text: 'Use tabs to pick a value, such as a billing period. Use `SegmentedControl` instead.' },
  ],
  parts: {
    'Tabs.Root': {
      description: 'Holds the selected tab and renders a `div`.',
      slot: 'cl-tabs-root',
      props: {
        value: { type: 'string', doc: 'The selected tab, when controlled.' },
        defaultValue: { type: 'string', doc: 'The selected tab on mount.', default: "''" },
        onValueChange: { type: '(value: string) => void', doc: 'Called with the newly selected tab.' },
        activationMode: {
          type: "'automatic' | 'manual'",
          doc: '`automatic` selects a tab when it gets focus; `manual` waits for Enter or Space.',
          default: "'automatic'",
        },
      },
    },
    'Tabs.List': {
      description: "The `role='tablist'`, with the indicator (`cl-tabs-indicator`) under the selected tab.",
      slot: 'cl-tabs-list',
    },
    'Tabs.Tab': {
      description: "A `role='tab'` button in the list, with roving focus. Carries `data-selected` and `data-disabled`.",
      slot: 'cl-tabs-tab',
      props: {
        value: { type: 'string', doc: "Identifies the tab. Matches a panel's `value`." },
        disabled: { type: 'boolean', doc: 'Disables the tab with `aria-disabled`, keeping it focusable.' },
      },
    },
    'Tabs.Trigger': {
      description:
        'A standalone button outside `Tabs.List` that selects a panel. Not part of the arrow-key navigation. Carries `data-selected` and `data-disabled`.',
      slot: 'cl-tabs-trigger',
      props: {
        value: { type: 'string', doc: "Matches a panel's `value`." },
        disabled: { type: 'boolean', doc: 'Disables the trigger.' },
      },
    },
    'Tabs.Panels': {
      description: 'Stacks the panels in one grid cell so they can animate in and out.',
      slot: 'cl-tabs-panels',
    },
    'Tabs.Panel': {
      description:
        "A `role='tabpanel'` labelled by its tab. Carries `data-open`, `data-closed` while leaving, and `data-hidden`, and sets `--cl-tab-transition-direction` to `1` or `-1`.",
      slot: 'cl-tabs-panel',
      props: {
        value: { type: 'string', doc: "Matches a tab's `value`." },
        keepMounted: { type: 'boolean', doc: 'Keeps the children rendered while the panel is hidden.' },
      },
    },
  },
  examples: [
    {
      title: 'Two tabs',
      code: `
<Tabs.Root defaultValue='members'>
  <Tabs.List>
    <Tabs.Tab value='members'>Members</Tabs.Tab>
    <Tabs.Tab value='invitations'>Invitations</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel value='members'>{members}</Tabs.Panel>
    <Tabs.Panel value='invitations'>{invitations}</Tabs.Panel>
  </Tabs.Panels>
</Tabs.Root>
`,
    },
  ],
  related: ['SegmentedControl'],
} satisfies ComponentDoc<{
  'Tabs.Root': TabsRootProps;
  'Tabs.List': TabsListProps;
  'Tabs.Tab': TabsTabProps;
  'Tabs.Trigger': TabsTriggerProps;
  'Tabs.Panels': TabsPanelsProps;
  'Tabs.Panel': TabsPanelProps;
}>;
