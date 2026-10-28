import * as stylex from '@stylexjs/stylex';
import React from 'react';
import { createPortal } from 'react-dom';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { ProfileContext } from './profile.context';
import { styles } from './profile-search.styles';

/** What the profile's search finds a target by. */
export interface SearchTargetOptions {
  /** Names the target in the search results. */
  label: string;
  /** Other words that find the target. */
  keywords?: readonly string[];
  /** Tells apart targets on one page that share a `label`. Defaults to the `label`. */
  id?: string;
}

export interface SearchTargetProps extends MosaicComponentProps<'div'>, SearchTargetOptions {}

/**
 * A part of a profile page that the profile's search can find, scroll to, and focus. Pass your own
 * element as `render` to make it the target, with no wrapper of its own. While the search builds
 * its index, the page renders a second, hidden time, and a target renders none of its children.
 *
 * ```tsx
 * <SearchTarget label='Seats' keywords={['members']} render={<section className='card' />}>
 *   <h3>Seats</h3>
 * </SearchTarget>
 * ```
 */
export const SearchTarget = React.forwardRef<HTMLDivElement, SearchTargetProps>(function SearchTarget(
  { label, keywords, id, render, xstyle, ...rest },
  ref,
) {
  const target = useSearchTarget({ label, keywords, id });
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [ref, target.ref],
    props: target.props(stylex.props(reset.base, xstyle), rest),
  });
  return target.marker ?? element;
});

/**
 * Whether this render is the hidden copy the profile's search builds its index from. Skip work
 * there that only the visible page needs, such as fetching data a target does not depend on.
 */
export function useIsSearchIndexing(): boolean {
  return React.useContext(SearchIndexingContext);
}

export function useSearchTarget(options: SearchTargetOptions | undefined) {
  const indexing = useIsSearchIndexing();
  const page = React.useContext(SearchPageContext);
  const profile = React.useContext(ProfileContext);
  const search = profile?.search;
  const key = options && page !== null ? targetKey(page, options.id ?? options.label) : null;
  const registerTarget = search?.registerTarget;
  const ref = React.useCallback(
    (element: HTMLElement | null) => {
      if (key !== null) {
        registerTarget?.(key, element);
      }
    },
    [key, registerTarget],
  );
  const highlighted = key !== null && search?.highlightedTarget === key;
  const marker =
    options && indexing ? (
      <div
        data-search-target={options.id ?? options.label}
        data-label={options.label}
        data-keywords={JSON.stringify(options.keywords ?? [])}
      />
    ) : null;

  function props<Rest extends Record<string, unknown>>(styleProps: ReturnType<typeof stylex.props>, rest: Rest) {
    if (key === null) {
      return mergeStyleProps(styleProps, rest);
    }
    return mergeStyleProps(
      themeProps('profile-search-target'),
      stylex.props(styles.target, highlighted && styles.targetHighlighted),
      styleProps,
      { tabIndex: -1, 'data-highlighted': highlighted ? '' : undefined },
      rest,
    );
  }

  return { marker, ref, props };
}

export function SearchHighlight() {
  const search = React.useContext(ProfileContext)?.search;
  if (!search?.highlightedTarget) {
    return null;
  }
  return (
    <div
      key={search.highlightedTarget}
      aria-hidden
      onAnimationEnd={search.clearHighlight}
      {...mergeStyleProps(themeProps('profile-search-highlight'), stylex.props(reset.base, styles.highlight))}
    />
  );
}

export function SearchIndexPage({ value, children }: { value: string; children: React.ReactNode }) {
  const profile = React.useContext(ProfileContext);
  const container = profile?.search.indexContainer;
  if (!container) {
    return null;
  }
  return createPortal(
    <SearchIndexingContext.Provider value>
      <SearchPageContext.Provider value={value}>
        <div data-search-page={value}>
          <SearchIndexBoundary>{children}</SearchIndexBoundary>
        </div>
      </SearchPageContext.Provider>
    </SearchIndexingContext.Provider>,
    container,
  );
}

class SearchIndexBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const SearchPageContext = React.createContext<string | null>(null);

const SearchIndexingContext = React.createContext(false);

export interface IndexedTarget {
  page: string;
  target: string;
  label: string;
  keywords: readonly string[];
}

const emptyIndex: readonly IndexedTarget[] = [];

export function useSearchIndex(container: HTMLElement | null): readonly IndexedTarget[] {
  const store = React.useMemo(() => (container ? indexStore(container) : null), [container]);
  return React.useSyncExternalStore(store?.subscribe ?? noSubscription, store?.read ?? readEmptyIndex, readEmptyIndex);
}

function indexStore(container: HTMLElement) {
  let snapshot = readIndex(container);
  return {
    subscribe: (onChange: () => void) => {
      snapshot = readIndex(container);
      const observer = new MutationObserver(() => {
        snapshot = readIndex(container);
        onChange();
      });
      observer.observe(container, {
        subtree: true,
        childList: true,
        attributeFilter: ['data-search-target', 'data-label', 'data-keywords'],
      });
      return () => observer.disconnect();
    },
    read: () => snapshot,
  };
}

function readIndex(container: HTMLElement): readonly IndexedTarget[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-search-target]')).flatMap(marker => {
    const page = marker.closest<HTMLElement>('[data-search-page]')?.dataset.searchPage;
    const { searchTarget: target, label, keywords } = marker.dataset;
    if (page === undefined || target === undefined || label === undefined) {
      return [];
    }
    return [{ page, target, label, keywords: parseKeywords(keywords) }];
  });
}

function parseKeywords(value: string | undefined): readonly string[] {
  const parsed: unknown = value ? JSON.parse(value) : [];
  return Array.isArray(parsed) ? parsed.filter((keyword): keyword is string => typeof keyword === 'string') : [];
}

function noSubscription() {
  return () => {};
}

function readEmptyIndex() {
  return emptyIndex;
}

export function targetKey(page: string, target: string): string {
  return JSON.stringify([page, target]);
}

interface Reveal {
  page: string;
  target: string | null;
}

export function useProfileSearch({
  value,
  selectPage,
  pageTitleRef,
}: {
  value: string;
  selectPage: (value: string) => void;
  pageTitleRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [container] = React.useState(() => (typeof document === 'undefined' ? null : document.createElement('div')));
  const indexContainer = focused || query.trim() !== '' ? container : null;
  const targetsRef = React.useRef(new Map<string, HTMLElement>());
  const [reveal, setReveal] = React.useState<Reveal | null>(null);
  const [highlightedTarget, setHighlightedTarget] = React.useState<string | null>(null);

  const registerTarget = React.useCallback((key: string, element: HTMLElement | null) => {
    if (element) {
      targetsRef.current.set(key, element);
    } else {
      targetsRef.current.delete(key);
    }
  }, []);

  const revealResult = React.useCallback(
    (page: string, target: string | null) => {
      setQuery('');
      setHighlightedTarget(null);
      setReveal({ page, target });
      selectPage(page);
    },
    [selectPage],
  );

  const clearHighlight = React.useCallback(() => setHighlightedTarget(null), []);

  React.useEffect(() => {
    if (!reveal || reveal.page !== value) {
      return;
    }
    setReveal(null);
    const key = reveal.target === null ? null : targetKey(reveal.page, reveal.target);
    const element = key === null ? undefined : targetsRef.current.get(key);
    if (key === null || !element) {
      pageTitleRef.current?.focus();
      return;
    }
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    element.focus({ preventScroll: true });
    setHighlightedTarget(key);
  }, [reveal, value, pageTitleRef]);

  return React.useMemo(
    () => ({
      query,
      setQuery,
      setFocused,
      indexContainer,
      registerTarget,
      revealResult,
      highlightedTarget,
      clearHighlight,
    }),
    [query, indexContainer, registerTarget, revealResult, highlightedTarget, clearHighlight],
  );
}

export type ProfileSearchState = ReturnType<typeof useProfileSearch>;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
