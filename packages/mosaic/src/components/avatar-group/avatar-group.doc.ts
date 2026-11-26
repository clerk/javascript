import type { ComponentDoc } from '../../docs-schema';
import type { AvatarGroupOverflowProps, AvatarGroupProps } from './avatar-group';

export default {
  name: 'AvatarGroup',
  description:
    'Stacks avatars in an overlapping row, cutting each one where the next overlaps it so the background shows through, with an optional count of the rest.',
  useFor: ['a row of member or collaborator avatars', 'a facepile with a "+N" count of the rest'],
  keywords: ['avatar group', 'facepile', 'avatar stack', 'members', 'overflow', 'more'],
  practices: [
    {
      do: true,
      text: 'Slice the list yourself and pass only the avatars to show, then `AvatarGroup.Overflow` with the rest.',
    },
    { do: true, text: 'Name the group with `aria-label`, such as "Members".' },
    {
      do: false,
      text: 'Set `size` on the avatars inside. The group sets it as the default, and an avatar of another size breaks the overlap.',
    },
    { do: false, text: 'Nest one `AvatarGroup.Root` inside another.' },
  ],
  parts: {
    'AvatarGroup.Root': {
      description: 'Lays the avatars out in an overlapping row and sets their default size and shape.',
      slot: 'cl-avatar-group',
      props: {
        shape: {
          type: "'circle' | 'square'",
          doc: 'Default shape of the avatars inside, and the shape of the overflow.',
          default: "'circle'",
        },
        size: {
          type: "'xs' | 'sm' | 'md' | 'lg'",
          doc: 'Default size of the avatars inside, and the size of the overflow.',
          default: "'md'",
        },
      },
    },
    'AvatarGroup.Overflow': {
      description:
        'Shows "+N" for the avatars left out, named "N more". Renders nothing when `count` is 0 or less. Use `render` to make it a button.',
      slot: 'cl-avatar-group-overflow',
      props: {
        count: { type: 'number', doc: 'How many avatars are not shown.' },
        label: { type: 'string', doc: 'The accessible name, with `{count}` filled in.', default: "'{count} more'" },
      },
    },
  },
  examples: [
    {
      title: 'Members with an overflow count',
      code: `
<AvatarGroup.Root aria-label='Members' size='sm'>
  {members.slice(0, 3).map(member => (
    <Avatar.Root key={member.id}>
      <Avatar.Image src={member.imageUrl} alt={member.name} />
      <Avatar.Fallback />
    </Avatar.Root>
  ))}
  <AvatarGroup.Overflow count={members.length - 3} />
</AvatarGroup.Root>
`,
    },
  ],
} satisfies ComponentDoc<{
  'AvatarGroup.Root': AvatarGroupProps;
  'AvatarGroup.Overflow': AvatarGroupOverflowProps;
}>;
