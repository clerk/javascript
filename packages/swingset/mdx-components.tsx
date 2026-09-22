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
    pre: PreBlock,
    Story: StoryEmbed,
    Preview: StoryPreview,
    PropTable,
    Usage: UsageBlock,
  };
}
