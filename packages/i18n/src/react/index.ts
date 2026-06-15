import type { ReactNode } from 'react';
import { createElement, Fragment, useCallback, useMemo, useSyncExternalStore } from 'react';

import type { MessageFormatPart, RichText } from '../message-format';
import type { ReadableStore } from '../types';

// useSyncExternalStore is the correct, concurrency-safe way to read a nanostores
// store in React. It removes the useEffect timing gap (a stale value between
// render and effect), is safe under concurrent rendering / Suspense, and handles
// SSR hydration. The nanostores contract maps directly onto it:
//   subscribe          -> store.listen  (future changes only; returns unbind)
//   getSnapshot        -> store.get     (stable ref until the value changes)
//   getServerSnapshot  -> opts.ssr (optional), defaulting to store.get
//
// (This is what @nanostores/react does; we keep a ~10-line local copy rather than
// add the dependency, and so we can carry the optional `ssr` snapshot.)

export interface UseStoreOptions<T> {
  /** Snapshot used during SSR / hydration. Defaults to the store's current value. */
  ssr?: () => T;
}

export function useStore<T>($store: ReadableStore<T>, options: UseStoreOptions<T> = {}): T {
  const { ssr } = options;
  // These must be referentially stable. Passing `$store.listen.bind($store)`
  // inline re-creates the subscribe function every render, so useSyncExternalStore
  // tears down and re-establishes the subscription on every commit — which
  // re-enters the scheduler and loops ("Maximum update depth exceeded").
  const subscribe = useCallback((onChange: () => void) => $store.listen(onChange), [$store]);
  const getSnapshot = useCallback(() => $store.get(), [$store]);
  const getServerSnapshot = useCallback(() => (ssr ? ssr() : $store.get()), [$store, ssr]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ---------------------------------------------------------------------------
// Rich-text rendering
// ---------------------------------------------------------------------------

/** Maps a markup tag name (`{#tag}`) to a component rendering its children. */
export type MessageComponents = Record<string, (children?: ReactNode) => ReactNode>;

export interface MessageRenderOptions {
  /** Values substituted for `{$name}` placeholders. */
  values?: Record<string, string | number>;
  /** Components used to render `{#tag}…{/tag}` and `{#tag/}` markup. */
  components?: MessageComponents;
}

/**
 * Fold the flat token stream into React nodes from `start`, stopping at the
 * close tag named `stopTag`. Markup nests; an open tag with no matching
 * component renders its children inline.
 */
function fold(
  parts: MessageFormatPart[],
  start: number,
  values: MessageRenderOptions['values'],
  components: MessageComponents | undefined,
  stopTag: string | undefined,
): { nodes: ReactNode[]; next: number } {
  const nodes: ReactNode[] = [];
  let i = start;

  while (i < parts.length) {
    const p = parts[i];

    if (p.type === 'text') {
      nodes.push(p.value);
      i++;
    } else if (p.type === 'string') {
      nodes.push(String(values?.[p.name] ?? ''));
      i++;
    } else if (p.kind === 'standalone') {
      const component = components?.[p.name];
      nodes.push(createElement(Fragment, { key: i }, component ? component() : null));
      i++;
    } else if (p.kind === 'close') {
      if (p.name === stopTag) {
        return { nodes, next: i + 1 };
      }
      i++; // stray close — skip
    } else {
      // open: fold the inner range, then wrap it with its component (if any).
      const inner = fold(parts, i + 1, values, components, p.name);
      const component = components?.[p.name];
      nodes.push(createElement(Fragment, { key: i }, component ? component(inner.nodes) : inner.nodes));
      i = inner.next;
    }
  }

  return { nodes, next: i };
}

/** Render a `RichText` message to React nodes, folding markup into elements. */
export function formatToReact(message: RichText, options: MessageRenderOptions = {}): ReactNode {
  const { nodes } = fold(message.parts, 0, options.values, options.components, undefined);
  return createElement(Fragment, null, ...nodes);
}

export interface MessageProps extends MessageRenderOptions {
  /** The `RichText` message to render (e.g. `m.notice`). */
  of: RichText;
}

/** Declarative rich-text rendering: `<Message of={m.notice} values={…} components={…} />`. */
export function Message({ of, values, components }: MessageProps): ReactNode {
  return formatToReact(of, { values, components });
}

/** Hook form of {@link Message}: returns the folded React nodes for a `RichText`. */
export function useMessage(message: RichText, options: MessageRenderOptions = {}): ReactNode {
  const { values, components } = options;
  return useMemo(() => formatToReact(message, { values, components }), [message, values, components]);
}
