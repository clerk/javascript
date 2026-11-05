import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
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
    props: target.props(stylex.props(xstyle), rest),
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
  const [snapshot, send] = useMachine(revealMachine, {
    context: { targetsRef, pageTitleRef },
  });
  const { reveal } = snapshot.context;

  const registerTarget = React.useCallback(
    (key: string, element: HTMLElement | null) => {
      if (element) {
        targetsRef.current.set(key, element);
        send({ type: 'TARGET_MOUNTED', key });
      } else {
        targetsRef.current.delete(key);
      }
    },
    [send],
  );

  const revealResult = React.useCallback(
    (page: string, target: string | null) => {
      setQuery('');
      send({ type: 'PICK', page, key: target === null ? null : targetKey(page, target) });
      selectPage(page);
    },
    [send, selectPage],
  );

  const clearHighlight = React.useCallback(() => send({ type: 'HIGHLIGHT_ENDED' }), [send]);

  React.useEffect(() => {
    send({ type: 'PAGE_SHOWN', page: value });
  }, [send, value, reveal]);

  const highlightedTarget = snapshot.value === 'highlighted' ? (reveal?.key ?? null) : null;

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

interface Reveal {
  page: string;
  key: string | null;
}

interface RevealContext {
  reveal: Reveal | null;
  targetsRef: React.RefObject<Map<string, HTMLElement>>;
  pageTitleRef: React.RefObject<HTMLHeadingElement | null>;
}

type RevealEvent =
  | { type: 'PICK'; page: string; key: string | null }
  | { type: 'PAGE_SHOWN'; page: string }
  | { type: 'TARGET_MOUNTED'; key: string }
  | { type: 'HIGHLIGHT_ENDED' };

const { createMachine, assign } = setup<RevealContext, RevealEvent>();

const pick = {
  target: 'opening',
  actions: assign((_, event: Extract<RevealEvent, { type: 'PICK' }>) => ({
    reveal: { page: event.page, key: event.key },
  })),
} as const;

const revealMachine = createMachine({
  id: 'profileSearchReveal',
  initial: 'idle',
  context: { reveal: null, targetsRef: { current: new Map() }, pageTitleRef: { current: null } },
  states: {
    idle: {
      on: { PICK: pick },
    },
    opening: {
      on: {
        PICK: pick,
        PAGE_SHOWN: [
          {
            guard: (context, event) => isRevealPage(context, event.page) && findTarget(context) !== undefined,
            target: 'highlighted',
            actions: bringTargetIntoView,
          },
          {
            guard: (context, event) => isRevealPage(context, event.page) && context.reveal?.key != null,
            target: 'waiting',
            actions: focusPageTitle,
          },
          {
            guard: (context, event) => isRevealPage(context, event.page),
            target: 'idle',
            actions: focusPageTitle,
          },
        ],
      },
    },
    waiting: {
      on: {
        PICK: pick,
        PAGE_SHOWN: { guard: (context, event) => !isRevealPage(context, event.page), target: 'idle' },
        TARGET_MOUNTED: {
          guard: (context, event) => event.key === context.reveal?.key && pageTitleHasFocus(context),
          target: 'highlighted',
          actions: bringTargetIntoView,
        },
      },
    },
    highlighted: {
      on: {
        PICK: pick,
        PAGE_SHOWN: { guard: (context, event) => !isRevealPage(context, event.page), target: 'idle' },
        HIGHLIGHT_ENDED: 'idle',
      },
    },
  },
});

function isRevealPage(context: RevealContext, page: string) {
  return context.reveal?.page === page;
}

function findTarget(context: RevealContext) {
  const key = context.reveal?.key;
  return key == null ? undefined : context.targetsRef.current?.get(key);
}

function pageTitleHasFocus(context: RevealContext) {
  const title = context.pageTitleRef.current;
  return title !== null && title.ownerDocument.activeElement === title;
}

function focusPageTitle(context: RevealContext) {
  context.pageTitleRef.current?.focus();
}

function bringTargetIntoView(context: RevealContext) {
  const element = findTarget(context);
  element?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  element?.focus({ preventScroll: true });
}

export type ProfileSearchState = ReturnType<typeof useProfileSearch>;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
