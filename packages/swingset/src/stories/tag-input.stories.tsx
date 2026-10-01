import { useLayoutAnimation } from '@clerk/mosaic/primitives/hooks';
import { TagInput } from '@clerk/mosaic/primitives/tag-input';
import { X } from 'lucide-react';
import { type ComponentProps, type ReactNode, useId, useRef } from 'react';

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

type LayoutItemProps = ReturnType<typeof useLayoutAnimation>['itemProps'];

function StyledTags({ className, itemProps }: { className: string; itemProps?: LayoutItemProps }) {
  const { tags } = TagInput.useTagInput();
  return tags.map(tag => (
    <TagInput.Tag
      key={tag.value}
      value={tag.value}
      className={className}
      {...itemProps}
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
  rootClassName?: string;
  inputItemProps?: LayoutItemProps;
};

function StyledField({ tags, rootClassName = '', inputItemProps, ...rootProps }: StyledFieldProps) {
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
        className={`border-input focus-within:ring-ring/50 flex min-h-24 cursor-text flex-wrap content-start gap-1.5 rounded-lg border p-2 focus-within:ring-2 ${rootClassName}`}
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
          className='min-w-[8ch] flex-1 bg-transparent text-sm outline-none'
          {...inputItemProps}
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

export function LayoutAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { itemProps } = useLayoutAnimation(rootRef);
  return (
    <StyledField
      ref={rootRef}
      defaultValue={['preston@clerk.dev', 'nate@clerk.dev']}
      rootClassName='relative [--cl-layout-duration:200ms] [--cl-layout-easing:ease-out]'
      inputItemProps={itemProps}
      tags={
        <StyledTags
          className={presenceTagClassName}
          itemProps={itemProps}
        />
      }
    />
  );
}
