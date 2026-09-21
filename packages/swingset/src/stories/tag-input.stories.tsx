import { TagInput } from '@clerk/mosaic/primitives/tag-input';
import { X } from 'lucide-react';
import { type ComponentProps, type ReactNode, useId, useState } from 'react';
import { flushSync } from 'react-dom';

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

const tagClassName =
  'bg-muted text-muted-foreground focus-visible:ring-ring data-invalid:bg-destructive/10 data-invalid:text-destructive inline-flex items-center gap-1 rounded-md py-0.5 pe-1 ps-2 text-sm outline-none focus-visible:ring-2';

const presenceTagClassName = `${tagClassName} data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none`;

const viewTransitionTagClassName = `${tagClassName} [view-transition-class:tag] [view-transition-name:match-element]`;

const viewTransitionInputClassName = '[view-transition-class:tag-input] [view-transition-name:match-element]';

const viewTransitionCss = `
::view-transition-group(*.tag),
::view-transition-group(*.tag-input) {
  animation-duration: 200ms;
  animation-timing-function: ease-out;
}
::view-transition-old(*.tag):only-child {
  animation: tag-exit 150ms ease-in forwards;
}
::view-transition-new(*.tag):only-child {
  animation: tag-enter 150ms ease-out;
}
::view-transition-old(*.tag-input) {
  display: none;
}
::view-transition-new(*.tag-input) {
  animation: none;
  block-size: 100%;
  object-fit: none;
  object-position: left center;
}
html[dir='rtl']::view-transition-new(*.tag-input) {
  object-position: right center;
}
@keyframes tag-exit {
  to { opacity: 0; transform: scale(0.9); }
}
@keyframes tag-enter {
  from { opacity: 0; transform: scale(0.9); }
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*.tag),
  ::view-transition-group(*.tag-input),
  ::view-transition-old(*.tag),
  ::view-transition-new(*.tag) {
    animation: none;
  }
}
`;

function StyledTags({ className, presentOnly = false }: { className: string; presentOnly?: boolean }) {
  const { tags } = TagInput.useTagInput();
  const visible = presentOnly ? tags.filter(tag => tag.present) : tags;
  return visible.map(tag => (
    <TagInput.Tag
      key={tag.value}
      value={tag.value}
      className={className}
    >
      {tag.value}
      <TagInput.TagRemove className='hover:bg-foreground/10 rounded-sm p-0.5'>
        <X className='size-3.5' />
      </TagInput.TagRemove>
    </TagInput.Tag>
  ));
}

type StyledFieldProps = Omit<ComponentProps<typeof TagInput.Root>, 'children'> & {
  tags: ReactNode;
  inputClassName?: string;
};

function StyledField({ tags, inputClassName = '', ...rootProps }: StyledFieldProps) {
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
        validate={value => value.includes('@')}
        {...rootProps}
        className='border-input focus-within:ring-ring/50 flex min-h-24 cursor-text flex-wrap content-start gap-1.5 rounded-lg border p-2 focus-within:ring-2'
      >
        <TagInput.List
          aria-label='Email addresses'
          className='contents'
        >
          {tags}
        </TagInput.List>
        <TagInput.Input
          id={inputId}
          aria-describedby={hintId}
          className={`min-w-[8ch] flex-1 bg-transparent text-sm outline-none ${inputClassName}`}
        />
      </TagInput.Root>
    </div>
  );
}

export function Styled() {
  return (
    <StyledField
      defaultValue={['preston@clerk.dev', 'nate@clerk.dev']}
      tags={<StyledTags className={presenceTagClassName} />}
    />
  );
}

export function ViewTransition() {
  const [value, setValue] = useState(['preston@clerk.dev', 'nate@clerk.dev']);
  return (
    <>
      <style>{viewTransitionCss}</style>
      <StyledField
        value={value}
        onValueChange={next => {
          if (typeof document.startViewTransition !== 'function') {
            setValue(next);
            return;
          }
          document.startViewTransition(() => {
            flushSync(() => setValue(next));
          });
        }}
        tags={
          <StyledTags
            className={viewTransitionTagClassName}
            presentOnly
          />
        }
        inputClassName={viewTransitionInputClassName}
      />
    </>
  );
}
