import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

export type MessageValues = Record<string, string | number>;

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export type MessageComponents = Record<string, (children?: ReactNode) => ReactNode>;

export interface RichOptions {
  values?: Record<string, ReactNode>;
  components?: MessageComponents;
}

export type MessageParams<T extends string> = T extends `${string}{${infer Key}}${infer Rest}`
  ? Key extends `#${string}` | `/${string}`
    ? MessageParams<Rest>
    : Key | MessageParams<Rest>
  : never;

export type MessageTags<T extends string> = T extends `${string}{#${infer Key}}${infer Rest}`
  ? (Key extends `${infer Name}/` ? Name : Key) | MessageTags<Rest>
  : never;

type Exactly<K extends string, V> = [K] extends [never] ? Partial<Record<string, never>> : Record<K, V>;

type Values<T extends string, V> = string extends T ? Record<string, V> : Exactly<MessageParams<T>, V>;

type Components<T extends string> = string extends T
  ? MessageComponents
  : Exactly<MessageTags<T>, MessageComponents[string]>;

type TypedRichOptions<T extends string> = string extends T
  ? [options?: RichOptions]
  : [MessageParams<T>] extends [never]
    ? [MessageTags<T>] extends [never]
      ? []
      : [options: { components: Components<T> }]
    : [MessageTags<T>] extends [never]
      ? [options: { values: Values<T, ReactNode> }]
      : [options: { values: Values<T, ReactNode>; components: Components<T> }];

type PluralParams<F extends PluralForms> = Exclude<MessageParams<Extract<F[keyof F], string>>, 'count'>;

type PluralValues<F extends PluralForms> = string extends F['other']
  ? [values?: MessageValues]
  : [PluralParams<F>] extends [never]
    ? []
    : [values: Record<PluralParams<F>, string | number>];

function own<T>(record: Partial<Record<string, T>> | undefined, key: string): T | undefined {
  return record && Object.hasOwn(record, key) ? record[key] : undefined;
}

export function fill<T extends string>(template: T, values: Values<T, string | number>): string;
export function fill(template: string, values: Partial<MessageValues>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(own(values, key) ?? match));
}

export function plural<F extends PluralForms>(
  forms: F,
  count: number,
  locale = 'en',
  ...rest: PluralValues<F>
): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template: string = own(forms, category) ?? forms.other;
  return fill(template, { ...rest[0], count });
}

type Token =
  | { type: 'text'; value: string }
  | { type: 'value'; name: string }
  | { type: 'open'; name: string }
  | { type: 'close'; name: string }
  | { type: 'standalone'; name: string };

const TOKEN_RE = /\{#(\w+)\/\}|\{#(\w+)\}|\{\/(\w+)\}|\{(\w+)\}/g;

function tokenize(template: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  for (const match of template.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > pos) {
      tokens.push({ type: 'text', value: template.slice(pos, index) });
    }
    const [, standalone, open, close, value] = match;
    if (standalone) {
      tokens.push({ type: 'standalone', name: standalone });
    } else if (open) {
      tokens.push({ type: 'open', name: open });
    } else if (close) {
      tokens.push({ type: 'close', name: close });
    } else {
      tokens.push({ type: 'value', name: value });
    }
    pos = index + match[0].length;
  }
  if (pos < template.length) {
    tokens.push({ type: 'text', value: template.slice(pos) });
  }
  return tokens;
}

function fold(
  tokens: Token[],
  start: number,
  stopTag: string | undefined,
  options: RichOptions,
): { nodes: ReactNode[]; next: number; closed: boolean } {
  const nodes: ReactNode[] = [];
  let i = start;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.type === 'text') {
      nodes.push(token.value);
      i++;
    } else if (token.type === 'value') {
      nodes.push(own(options.values, token.name) ?? `{${token.name}}`);
      i++;
    } else if (token.type === 'standalone') {
      const component = own(options.components, token.name);
      nodes.push(createElement(Fragment, { key: i }, component ? component() : null));
      i++;
    } else if (token.type === 'close') {
      if (token.name === stopTag) {
        return { nodes, next: i + 1, closed: true };
      }
      nodes.push(`{/${token.name}}`);
      i++;
    } else {
      const inner = fold(tokens, i + 1, token.name, options);
      if (inner.closed) {
        const component = own(options.components, token.name);
        nodes.push(createElement(Fragment, { key: i }, component ? component(inner.nodes) : inner.nodes));
      } else {
        nodes.push(`{#${token.name}}`, ...inner.nodes);
      }
      i = inner.next;
    }
  }
  return { nodes, next: i, closed: false };
}

export function rich<T extends string>(template: T, ...rest: TypedRichOptions<T>): ReactNode;
export function rich(template: string, options: RichOptions = {}): ReactNode {
  return createElement(Fragment, null, ...fold(tokenize(template), 0, undefined, options).nodes);
}
