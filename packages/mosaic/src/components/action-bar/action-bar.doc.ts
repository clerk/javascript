import type { ComponentDoc } from '../../docs-schema';
import type {
  ActionBarActionProps,
  ActionBarCountProps,
  ActionBarDismissProps,
  ActionBarRootProps,
  ActionBarSeparatorProps,
} from './action-bar';

export default {
  name: 'ActionBar',
  description:
    'A floating `role="toolbar"` of bulk actions that rests on the bottom edge of a table while rows are selected. Portals, follows its anchor, moves focus between actions with the arrow keys and announces the selection in a live region.',
  useFor: [
    'bulk actions for selected table rows',
    'a selection toolbar with a count and a clear button',
    'announcing how many rows are selected',
  ],
  keywords: ['action bar', 'bulk actions', 'selection', 'toolbar', 'table', 'multi-select'],
  practices: [
    { do: true, text: 'Pass `finalFocus` so focus has somewhere to go when the bar closes while it holds focus.' },
    { do: true, text: "Inside a modal dialog, pass the dialog's popup as `portalRoot`." },
    {
      do: true,
      text: 'Pass localized `announcement` and `openAnnouncement` strings, and a localized `aria-label` on `ActionBar.Dismiss`.',
    },
    { do: false, text: 'Unmount the bar to hide it. Set `open={false}` so it can animate out and return focus.' },
  ],
  parts: {
    'ActionBar.Root': {
      description:
        'Positions the bar under `anchor`, kept inside the scrolling ancestor, and hides it when the anchor scrolls out of view. Stays mounted until the exit animation ends. Carries `data-open`, `data-starting-style` and `data-ending-style`.',
      slot: 'cl-action-bar',
      props: {
        open: { type: 'boolean', doc: 'Shows the bar.' },
        anchor: { type: 'React.RefObject<HTMLElement | null>', doc: 'The table the bar rests on.' },
        portalRoot: { type: 'HTMLElement | null', doc: 'Where the bar is portalled.' },
        finalFocus: {
          type: 'React.RefObject<HTMLElement | null> | (() => HTMLElement | null)',
          doc: 'Where focus goes when the bar closes while holding it: an element ref, or a function returning one.',
        },
        announcement: {
          type: 'string',
          doc: 'Announced when the selection changes while the bar is open, such as `3 selected`.',
        },
        openAnnouncement: { type: 'string', doc: 'Announced when the bar opens.', default: '`announcement`' },
        positionerXstyle: {
          type: 'XStyle',
          doc: 'StyleX for the positioner around the bar, which carries `cl-action-bar-positioner`.',
        },
      },
    },
    'ActionBar.Action': {
      description:
        'A `Button` in the arrow-key group. Takes every `Button` prop; defaults to `ghost` and `md`. `color="negative"` gets the destructive style.',
      slot: 'cl-button',
    },
    'ActionBar.Count': {
      description: 'The selection count. The bar is described by it through `aria-describedby`, so it owns its `id`.',
      slot: 'cl-action-bar-count',
    },
    'ActionBar.Separator': {
      description: 'A vertical `role="separator"` between groups of actions.',
      slot: 'cl-action-bar-separator',
    },
    'ActionBar.Dismiss': {
      description: 'A square icon `ActionBar.Action` with an X glyph, for clearing the selection.',
      slot: 'cl-action-bar-dismiss',
      props: {
        'aria-label': {
          type: 'string',
          doc: 'Accessible name. Pass a localized string.',
          default: "'Clear selection'",
        },
      },
    },
  },
  examples: [
    {
      title: 'Bulk actions on a table',
      code: `
<ActionBar.Root
  open={selected.length > 0}
  anchor={tableRef}
  finalFocus={tableRef}
  announcement={fill(m.selected, { count: selected.length })}
>
  <ActionBar.Count>{fill(m.selected, { count: selected.length })}</ActionBar.Count>
  <ActionBar.Separator />
  <ActionBar.Action color='negative' onClick={onRemove}>
    {m.remove}
  </ActionBar.Action>
  <ActionBar.Dismiss aria-label={m.clearSelection} onClick={onClear} />
</ActionBar.Root>
`,
    },
  ],
  related: ['Table', 'Button'],
} satisfies ComponentDoc<{
  'ActionBar.Root': ActionBarRootProps;
  'ActionBar.Action': ActionBarActionProps;
  'ActionBar.Count': ActionBarCountProps;
  'ActionBar.Separator': ActionBarSeparatorProps;
  'ActionBar.Dismiss': ActionBarDismissProps;
}>;
