import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { ProfileContext } from './profile.context';
import { styles } from './profile-search.styles';

export interface SearchTargetProps extends MosaicComponentProps<'div'> {
  /** The `id` of the page's search target this element is. */
  id: string;
}

/**
 * The element the profile's search scrolls to and focuses for the target with this `id`. Pass your
 * own element as `render` to make it the target, with no wrapper of its own.
 *
 * ```tsx
 * <SearchTarget id='seats' render={<section className='card' />}>
 *   <h3>Seats</h3>
 * </SearchTarget>
 * ```
 */
export const SearchTarget = React.forwardRef<HTMLDivElement, SearchTargetProps>(function SearchTarget(
  { id, render, xstyle, ...rest },
  ref,
) {
  const target = useSearchTarget(id);
  return useRender({
    defaultTagName: 'div',
    render,
    ref: [ref, target.ref],
    props: target.props(stylex.props(reset.base, xstyle), rest),
  });
});

export function useSearchTarget(id: string | undefined) {
  const page = React.useContext(SearchPageContext);
  const search = React.useContext(ProfileContext)?.search;
  const key = id !== undefined && page !== null ? targetKey(page, id) : null;
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

  return { ref, props };
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

export const SearchPageContext = React.createContext<string | null>(null);

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
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    element.focus({ preventScroll: true });
    setHighlightedTarget(key);
  }, [reveal, value, pageTitleRef]);

  return React.useMemo(
    () => ({
      query,
      setQuery,
      registerTarget,
      revealResult,
      highlightedTarget,
      clearHighlight,
    }),
    [query, registerTarget, revealResult, highlightedTarget, clearHighlight],
  );
}

export type ProfileSearchState = ReturnType<typeof useProfileSearch>;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
