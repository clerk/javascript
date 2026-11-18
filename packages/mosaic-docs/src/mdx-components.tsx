import type { MDXComponents } from 'mdx/types';
import { type ComponentProps, isValidElement, type ReactNode } from 'react';

import { CodeBlock, isCodeLanguage } from '@/ui/code-block';
import { Steps } from '@/ui/steps';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { pre: Pre, Steps, ...components };
}

function Pre(props: ComponentProps<'pre'>) {
  const code = props.children;
  if (isValidElement<{ className?: string; children?: ReactNode }>(code) && typeof code.props.children === 'string') {
    const lang = code.props.className?.replace(/^language-/, '') ?? '';
    if (isCodeLanguage(lang)) {
      return (
        <CodeBlock
          code={code.props.children.trimEnd()}
          lang={lang}
        />
      );
    }
  }
  return <pre {...props} />;
}
