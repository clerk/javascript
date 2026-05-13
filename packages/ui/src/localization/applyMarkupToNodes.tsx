import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

import { applyTokensToString, type Tokens } from './applyTokensToString';

const TAGS = {
  bold: 'strong',
} as const;

type TagName = keyof typeof TAGS;

const TAG_RE = /<(\/?)(bold)>/g;

export const stripMarkup = (s: string): string => s.replace(TAG_RE, '');

export const applyMarkupAndTokens = (template: string | undefined, tokens: Tokens): ReactNode => {
  if (!template) return '';
  if (!template.includes('<')) {
    return applyTokensToString(template, tokens);
  }

  type Frame = { tag: TagName | 'root'; children: ReactNode[] };
  const stack: Frame[] = [{ tag: 'root', children: [] }];
  let cursor = 0;
  let keyCounter = 0;
  let match: RegExpExecArray | null;

  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(template)) !== null) {
    const [full, slash, tag] = match;
    const text = template.slice(cursor, match.index);
    if (text) stack[stack.length - 1].children.push(applyTokensToString(text, tokens));
    cursor = match.index + full.length;

    if (!slash) {
      stack.push({ tag: tag as TagName, children: [] });
      continue;
    }

    const top = stack.pop();
    if (!top || top.tag !== tag) {
      return applyTokensToString(template, tokens);
    }
    stack[stack.length - 1].children.push(
      createElement(TAGS[top.tag as TagName], { key: keyCounter++ }, ...top.children),
    );
  }

  if (stack.length !== 1) {
    return applyTokensToString(template, tokens);
  }

  const tail = template.slice(cursor);
  if (tail) stack[0].children.push(applyTokensToString(tail, tokens));

  const out = stack[0].children;
  if (out.length === 0) return '';
  if (out.length === 1) return out[0];
  return createElement(Fragment, null, ...out);
};
