import type { ComponentDoc } from '../../docs-schema';
import type {
  EmptyStateActionsProps,
  EmptyStateDescriptionProps,
  EmptyStateIconProps,
  EmptyStateLabelProps,
  EmptyStateProps,
} from './empty-state';

export default {
  name: 'EmptyState',
  description:
    'The placeholder a list or table shows when it has nothing in it: an icon, a label, a description and actions.',
  useFor: ['an empty list or table', 'a "no results" message with an action', 'a first-run prompt to create something'],
  keywords: ['empty state', 'empty', 'no results', 'no data', 'placeholder', 'zero state'],
  practices: [
    { do: true, text: 'Give `EmptyState.Icon` a `glyph`. It draws the icon in a filled frame.' },
    { do: false, text: 'Use it while content is loading. Use `Skeleton` instead.' },
  ],
  parts: {
    'EmptyState.Root': { description: 'The container, as a `div`.', slot: 'cl-empty-state' },
    'EmptyState.Icon': {
      description: 'A `span` holding the glyph in a filled `IconFrame`. Takes no children.',
      slot: 'cl-empty-state-icon',
      props: { glyph: { type: 'IconComponent', doc: 'The icon to show.' } },
    },
    'EmptyState.Label': { description: 'The headline, as a `p`.', slot: 'cl-empty-state-label' },
    'EmptyState.Description': { description: 'Supporting copy, as a `p`.', slot: 'cl-empty-state-description' },
    'EmptyState.Actions': { description: 'A row for buttons, as a `div`.', slot: 'cl-empty-state-actions' },
  },
  examples: [
    {
      title: 'No invitations',
      code: `
<EmptyState.Root>
  <EmptyState.Icon glyph={Envelope} />
  <EmptyState.Label>{m.emptyTitle}</EmptyState.Label>
  <EmptyState.Description>{m.emptyDescription}</EmptyState.Description>
  <EmptyState.Actions>
    <Button onClick={onInvite}>{m.invite}</Button>
  </EmptyState.Actions>
</EmptyState.Root>
`,
    },
  ],
  related: ['Skeleton', 'Table'],
} satisfies ComponentDoc<{
  'EmptyState.Root': EmptyStateProps;
  'EmptyState.Icon': EmptyStateIconProps;
  'EmptyState.Label': EmptyStateLabelProps;
  'EmptyState.Description': EmptyStateDescriptionProps;
  'EmptyState.Actions': EmptyStateActionsProps;
}>;
