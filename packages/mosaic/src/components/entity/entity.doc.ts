import type { ComponentDoc } from '../../docs-schema';
import type { MosaicComponentProps } from '../../props';

export default {
  name: 'Entity',
  description:
    'A media-and-text row for one user, organization or other thing: an avatar or icon beside a label and a one-line description.',
  useFor: [
    'a user or organization cell in a table',
    'an avatar beside a name and email',
    'a list row that names one thing',
  ],
  keywords: ['entity', 'user row', 'avatar and name', 'identity', 'media object', 'list item'],
  practices: [
    { do: true, text: 'Put the label and description inside `Entity.Content`, beside `Entity.Media`.' },
    { do: true, text: 'Use `Avatar.Root` with `size="fit"` in `Entity.Media`, so the media box sizes it.' },
  ],
  parts: {
    'Entity.Root': { description: 'The row, as a `div`.', slot: 'cl-entity' },
    'Entity.Media': { description: 'The leading avatar or icon box.', slot: 'cl-entity-media' },
    'Entity.Content': { description: 'Stacks the label and description.', slot: 'cl-entity-content' },
    'Entity.Label': {
      description: 'The name. Runs of text truncate to one line; element children such as icons pass through.',
      slot: 'cl-entity-label',
    },
    'Entity.Description': { description: 'Secondary text. Truncates to one line.', slot: 'cl-entity-description' },
  },
  examples: [
    {
      title: 'A member',
      code: `
<Entity.Root>
  <Entity.Media>
    <Avatar.Root size='fit'>
      <Avatar.Image src={member.imageUrl} alt="" />
      <Avatar.Fallback />
    </Avatar.Root>
  </Entity.Media>
  <Entity.Content>
    <Entity.Label>{member.name}</Entity.Label>
    <Entity.Description>{member.email}</Entity.Description>
  </Entity.Content>
</Entity.Root>
`,
    },
  ],
  related: ['Avatar', 'Table'],
} satisfies ComponentDoc<{
  'Entity.Root': MosaicComponentProps<'div'>;
  'Entity.Media': MosaicComponentProps<'div'>;
  'Entity.Content': MosaicComponentProps<'div'>;
  'Entity.Label': MosaicComponentProps<'div'>;
  'Entity.Description': MosaicComponentProps<'div'>;
}>;
