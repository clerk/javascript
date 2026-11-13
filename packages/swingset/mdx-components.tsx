import { LinkIcon } from 'lucide-react';
import * as React from 'react';

import { CodeBlock } from './src/components/CodeBlock';
import { usePlayground } from './src/components/PlaygroundContext';
import { PropTable } from './src/components/PropTable';
import { StatusBadge } from './src/components/StatusDot';
import { StoryEmbed } from './src/components/StoryEmbed';
import { StoryPreview } from './src/components/StoryPreview';
import { UsageBlock } from './src/components/UsageBlock';
import { ViewSource } from './src/components/ViewSource';

// Every doc page's `# Title` renders as one flex row with the entry's status badge and
// the "View source" link, all read from the surrounding `PlaygroundProvider` so the MDX
// itself stays unaware of them. One row keeps the three vertically centered together.
function DocTitle({ children }: { children?: React.ReactNode }) {
  const meta = usePlayground()?.meta;
  return (
    <div className='mb-8 flex items-center gap-3'>
      {/* `!` so the zeroed margins beat `.prose h1`, which otherwise skews the row's centering. */}
      <h1 className='my-0!'>{children}</h1>
      {meta?.status ? (
        <StatusBadge
          status={meta.status}
          substatus={meta.substatus}
        />
      ) : null}
      {meta?.source ? (
        <span className='ml-auto'>
          <ViewSource source={meta.source} />
        </span>
      ) : null}
    </div>
  );
}

type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

function createHeading(Tag: HeadingTag) {
  return function Heading({ id, children, ...props }: React.ComponentProps<HeadingTag>) {
    if (!id) {
      return <Tag {...props}>{children}</Tag>;
    }
    return (
      <Tag
        id={id}
        className='flex items-center gap-2'
        {...props}
      >
        <a
          href={`#${id}`}
          className='peer text-inherit no-underline [font-weight:inherit]'
        >
          {children}
        </a>
        <LinkIcon
          aria-hidden
          className='text-muted-foreground size-3.5 shrink-0 opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100'
        />
      </Tag>
    );
  };
}

function PreBlock({ children }: { children?: React.ReactNode }) {
  if (React.isValidElement(children) && (children as React.ReactElement).type === 'code') {
    const { className, children: code } = (children as React.ReactElement<{ className?: string; children: string }>)
      .props;
    return <CodeBlock className={className}>{code}</CodeBlock>;
  }
  return <pre>{children}</pre>;
}

type MDXComponents = Record<string, React.ElementType>;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: DocTitle,
    h2: createHeading('h2'),
    h3: createHeading('h3'),
    h4: createHeading('h4'),
    h5: createHeading('h5'),
    h6: createHeading('h6'),
    pre: PreBlock,
    Story: StoryEmbed,
    Preview: StoryPreview,
    PropTable,
    Usage: UsageBlock,
  };
}
