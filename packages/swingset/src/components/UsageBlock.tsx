'use client';

import * as React from 'react';

import type { KnobValues } from '@/lib/types';

import { CodeBlock } from './CodeBlock';
import { usePlayground } from './PlaygroundContext';

interface UsageBlockProps {
  /** JSX tag rendered in the snippet, e.g. `Button`. */
  component: string;
  /** Import source; when set, an `import { component } from 'module'` line is prepended. */
  module?: string;
  /** Static props authored in MDX (e.g. `placeholder`) that aren't variant knobs. */
  props?: Record<string, KnobValues[string]>;
  /** Inner content of the component (rendered as JSX children text). */
  children?: React.ReactNode;
}

function formatProp(key: string, value: KnobValues[string]): string | null {
  if (typeof value === 'boolean') {
    // Booleans read as usage code: bare attribute when on, omitted when off.
    return value ? key : null;
  }
  if (typeof value === 'number') {
    return `${key}={${value}}`;
  }
  return `${key}='${value}'`;
}

function childrenToString(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(childrenToString).join('');
  }
  if (React.isValidElement(node)) {
    return childrenToString((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

function buildCode(component: string, module: string | undefined, attrs: string[], inner: string): string {
  const lines: string[] = [];

  if (module) {
    lines.push(`import { ${component} } from '${module}';`, '');
  }

  if (attrs.length === 0) {
    lines.push(inner ? `<${component}>${inner}</${component}>` : `<${component} />`);
  } else {
    lines.push(`<${component}`);
    for (const attr of attrs) {
      lines.push(`  ${attr}`);
    }
    if (inner) {
      lines.push('>', `  ${inner}`, `</${component}>`);
    } else {
      lines.push('/>');
    }
  }

  return lines.join('\n');
}

/**
 * A live `Usage` code block for a component overview. Reads the shared playground state so
 * editing a prop in the `<PropTable>` regenerates the snippet in place: variant props come
 * from the current knob values, then any static props authored in MDX are appended.
 */
export function UsageBlock({ component, module, props: staticProps = {}, children }: UsageBlockProps) {
  const playground = usePlayground();

  const attrs: string[] = [];
  // Variant props first, in knob order, skipping any the author overrides statically below.
  for (const key of playground ? Object.keys(playground.knobs) : []) {
    if (key in staticProps || !playground) {
      continue;
    }
    const formatted = formatProp(key, playground.values[key]);
    if (formatted !== null) {
      attrs.push(formatted);
    }
  }
  for (const [key, value] of Object.entries(staticProps)) {
    const formatted = formatProp(key, value);
    if (formatted !== null) {
      attrs.push(formatted);
    }
  }

  const code = buildCode(component, module, attrs, childrenToString(children).trim());

  return <CodeBlock className='language-tsx'>{code}</CodeBlock>;
}
