import type { ReactNode } from 'react';
import { createElement, Fragment, useCallback, useMemo, useSyncExternalStore } from 'react';

import type { RichText } from '../message-format';
import { walk } from '../message-format';
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

/** Render a `RichText` message to React nodes, folding markup into elements. */
export function formatToReact(message: RichText, options: MessageRenderOptions = {}): ReactNode {
  const { values, components } = options;
  // Same traversal as the string path (see `walk`); only the combine step differs:
  // markup becomes a keyed Fragment, an absent component renders children inline.
  const { items } = walk<ReactNode>(message.parts, 0, undefined, {
    text: value => value,
    value: name => String(values?.[name] ?? ''),
    markup: (kind, name, children, index) => {
      const component = components?.[name];
      if (kind === 'standalone') {
        return createElement(Fragment, { key: index }, component ? component() : null);
      }
      return createElement(Fragment, { key: index }, component ? component(children) : children);
    },
  });
  return createElement(Fragment, null, ...items);
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
