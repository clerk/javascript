import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

import { applyTokensToString, type Tokens } from './applyTokensToString';

const TAGS = {
  bold: 'strong',
} as const;

type TagName = keyof typeof TAGS;

const TAG_RE = /<(\/?)(bold)>/g;

export const stripMarkup = (s: string): string => s.replace(/<\/?(bold)>/g, '');

export const applyMarkupAndTokens = (template: string | undefined, tokens: Tokens): ReactNode => {
  if (!template) return '';
  const substitute = (s: string) => (s.includes('{{') ? applyTokensToString(s, tokens) : s);
  if (!template.includes('<')) {
    return substitute(template);
  }

  type Frame = { tag: TagName | 'root'; children: ReactNode[] };
  const stack: Frame[] = [{ tag: 'root', children: [] }];
  let cursor = 0;
  let match: RegExpExecArray | null;

  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(template)) !== null) {
    const [full, slash, tag] = match;
    const text = template.slice(cursor, match.index);
    if (text) stack[stack.length - 1].children.push(substitute(text));
    cursor = match.index + full.length;

    if (!slash) {
      stack.push({ tag: tag as TagName, children: [] });
      continue;
    }

    const top = stack.pop();
    if (!top || top.tag !== tag) {
      return substitute(template);
    }
    stack[stack.length - 1].children.push(
      createElement(TAGS[top.tag as TagName], { key: match.index }, ...top.children),
    );
  }

  if (stack.length !== 1) {
    return substitute(template);
  }

  const tail = template.slice(cursor);
  if (tail) stack[0].children.push(substitute(tail));

  const out = stack[0].children;
  if (out.length === 0) return '';
  if (out.length === 1) return out[0];
  return createElement(Fragment, null, ...out);
};
