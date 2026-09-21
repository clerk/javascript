import { TagInput } from '@clerk/mosaic/primitives/tag-input';
import { X } from 'lucide-react';
import { useId } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'wip',
  title: 'TagInput',
  label: 'Tag Input',
  source: 'packages/mosaic/src/primitives/tag-input/index.ts',
};

function Tags() {
  const { tags } = TagInput.useTagInput();
  return tags.map(tag => (
    <TagInput.Tag
      key={tag.value}
      value={tag.value}
    >
      {tag.value}
      <TagInput.TagRemove>×</TagInput.TagRemove>
    </TagInput.Tag>
  ));
}

export function Default() {
  return (
    <TagInput.Root
      defaultValue={['preston@clerk.dev', 'nate@clerk.dev']}
      validate={value => value.includes('@')}
    >
      <TagInput.List aria-label='Email addresses'>
        <Tags />
      </TagInput.List>
      <TagInput.Input
        aria-label='Email'
        placeholder='Add an email'
      />
    </TagInput.Root>
  );
}

function StyledTags() {
  const { tags } = TagInput.useTagInput();
  return tags.map(tag => (
    <TagInput.Tag
      key={tag.value}
      value={tag.value}
      className='bg-muted text-muted-foreground focus-visible:ring-ring data-invalid:bg-destructive/10 data-invalid:text-destructive data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 inline-flex items-center gap-1 rounded-md py-0.5 pe-1 ps-2 text-sm outline-none transition-[opacity,scale] duration-150 ease-out focus-visible:ring-2 motion-reduce:transition-none'
    >
      {tag.value}
      <TagInput.TagRemove className='hover:bg-foreground/10 rounded-sm p-0.5'>
        <X className='size-3.5' />
      </TagInput.TagRemove>
    </TagInput.Tag>
  ));
}

export function Styled() {
  const id = useId();
  const inputId = `${id}-input`;
  const hintId = `${id}-hint`;
  return (
    <div className='flex w-full max-w-md flex-col gap-2'>
      <div className='flex items-baseline justify-between'>
        <label
          htmlFor={inputId}
          className='text-sm font-medium'
        >
          Email
        </label>
        <span
          id={hintId}
          className='text-muted-foreground text-xs'
        >
          Press enter, comma, or paste to add
        </span>
      </div>
      <TagInput.Root
        defaultValue={['preston@clerk.dev', 'nate@clerk.dev']}
        validate={value => value.includes('@')}
        className='border-input focus-within:ring-ring/50 flex min-h-24 cursor-text flex-wrap content-start gap-1.5 rounded-lg border p-2 focus-within:ring-2'
      >
        <TagInput.List
          aria-label='Email addresses'
          className='contents'
        >
          <StyledTags />
        </TagInput.List>
        <TagInput.Input
          id={inputId}
          aria-describedby={hintId}
          className='min-w-[8ch] flex-1 bg-transparent text-sm outline-none'
        />
      </TagInput.Root>
    </div>
  );
}
