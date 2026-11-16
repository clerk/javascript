import { evaluate } from '@mdx-js/mdx';
import type { MDXComponents } from 'mdx/types';
import { isValidElement, type ReactNode } from 'react';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from '@/components/CodeBlock';

function Pre({ children }: { children?: ReactNode }) {
  if (isValidElement<{ className?: string; children?: unknown }>(children)) {
    const { className, children: code } = children.props;
    if (typeof code === 'string') {
      return (
        <CodeBlock
          code={code}
          lang={className?.match(/language-(\w+)/)?.[1] ?? 'text'}
        />
      );
    }
  }
  return <pre>{children}</pre>;
}

/** Renders an MDX string (generated swingset docs) on the server. */
export async function renderMDX(source: string, components: MDXComponents = {}) {
  const { default: Content } = await evaluate(source, { ...runtime, remarkPlugins: [remarkGfm] });
  return <Content components={{ pre: Pre, ...components }} />;
}
