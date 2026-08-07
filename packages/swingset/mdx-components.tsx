import * as React from 'react';

import { CodeBlock } from './src/components/CodeBlock';
import { PropTable } from './src/components/PropTable';
import { StoryEmbed } from './src/components/StoryEmbed';
import { StoryPreview } from './src/components/StoryPreview';
import { UsageBlock } from './src/components/UsageBlock';

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
    pre: PreBlock,
    Story: StoryEmbed,
    Preview: StoryPreview,
    PropTable,
    Usage: UsageBlock,
  };
}
