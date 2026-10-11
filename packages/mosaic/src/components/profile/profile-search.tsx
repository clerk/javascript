import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useMessages } from '../../localization';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { Button } from '../button';
import { Combobox } from '../combobox';
import { Icon } from '../icon';
import { InputGroup } from '../input-group';
import { ProfileContext, useProfileContext } from './profile.context';
import { styles } from './profile-search.styles';

export interface ProfileSearchSection {
  /** The `id` of the `Profile.SearchTarget` that holds the section. */
  id: string;
  label: string;
}

export interface ProfileSearchPage {
  value: string;
  label: string;
  icon?: React.ReactNode;
  sections?: readonly ProfileSearchSection[];
}

interface Reveal {
  page: string;
  target: string | null;
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useSearchReveal({
  value,
  selectPage,
  pageTitleRef,
}: {
  value: string;
  selectPage: (value: string) => void;
  pageTitleRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const targetsRef = React.useRef(new Map<string, HTMLElement>());
  const [reveal, setReveal] = React.useState<Reveal | null>(null);
  const [highlightedTarget, setHighlightedTarget] = React.useState<string | null>(null);

  const registerSearchTarget = React.useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      targetsRef.current.set(id, element);
    } else {
      targetsRef.current.delete(id);
    }
  }, []);

  const revealSearchResult = React.useCallback(
    (page: string, target: string | null) => {
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
    const element = reveal.target === null ? undefined : targetsRef.current.get(reveal.target);
    if (reveal.target === null || !element?.firstElementChild) {
      pageTitleRef.current?.focus();
      return;
    }
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    element.focus({ preventScroll: true });
    setHighlightedTarget(reveal.target);
  }, [reveal, value, pageTitleRef]);

  return React.useMemo(
    () => ({ registerSearchTarget, revealSearchResult, highlightedTarget, clearHighlight }),
    [registerSearchTarget, revealSearchResult, highlightedTarget, clearHighlight],
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const start = text.toLocaleLowerCase().indexOf(query);
  if (start === -1) {
    return text;
  }
  const end = start + query.length;
  return (
    <span>
      {text.slice(0, start)}
      <mark {...mergeStyleProps(themeProps('profile-search-match'), stylex.props(reset.base, styles.match))}>
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </span>
  );
}

interface Result {
  key: string;
  label: string;
  page: string;
  target: string | null;
}

function matchesOf(pages: readonly ProfileSearchPage[], query: string) {
  const matches = (label: string) => label.toLocaleLowerCase().includes(query);
  return pages
    .map(page => {
      const results: Result[] = [];
      if (matches(page.label)) {
        results.push({ key: page.value, label: page.label, page: page.value, target: null });
      }
      for (const section of page.sections ?? []) {
        if (matches(section.label)) {
          results.push({
            key: `${page.value}#${section.id}`,
            label: section.label,
            page: page.value,
            target: section.id,
          });
        }
      }
      return { page, results };
    })
    .filter(group => group.results.length > 0);
}

export function ProfileSearch({
  pages,
  query,
  onQueryChange,
}: {
  pages: readonly ProfileSearchPage[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const m = useMessages('profile');
  const { revealSearchResult } = useProfileContext('Profile.Nav');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const groupId = React.useId();
  const normalized = query.trim().toLocaleLowerCase();
  const groups = normalized ? matchesOf(pages, normalized) : [];
  const results = new Map(groups.flatMap(group => group.results.map(result => [result.key, result] as const)));

  return (
    <Combobox.Root
      inline
      open={normalized !== ''}
      value={null}
      inputValue={query}
      onInputValueChange={onQueryChange}
      onValueChange={key => {
        const result = key === null ? undefined : results.get(key);
        if (result) {
          revealSearchResult(result.page, result.target);
        }
      }}
    >
      <InputGroup.Root
        xstyle={styles.search}
        {...themeProps('profile-search')}
      >
        <InputGroup.Start>
          <Icon name='magnifying-glass' />
        </InputGroup.Start>
        <Combobox.Input
          ref={inputRef}
          type='search'
          autoComplete='off'
          aria-label={m.search.label}
          placeholder={m.search.label}
          onKeyDown={event => {
            if (event.key === 'Escape' && query !== '') {
              event.stopPropagation();
              onQueryChange('');
            }
          }}
        />
        {query ? (
          <InputGroup.End>
            <Button
              type='button'
              aria-label={m.search.clear}
              onClick={() => {
                onQueryChange('');
                inputRef.current?.focus();
              }}
            >
              <Icon name='x' />
            </Button>
          </InputGroup.End>
        ) : null}
      </InputGroup.Root>
      {normalized ? (
        <Combobox.List
          aria-label={m.search.label}
          xstyle={styles.results}
          {...themeProps('profile-search-results')}
        >
          {groups.length === 0 ? <Combobox.Empty>{m.search.empty}</Combobox.Empty> : null}
          {groups.map(({ page, results: pageResults }) => (
            <div
              key={page.value}
              role='group'
              aria-labelledby={`${groupId}-${page.value}`}
              {...mergeStyleProps(themeProps('profile-search-group'), stylex.props(reset.base, styles.group))}
            >
              <div
                id={`${groupId}-${page.value}`}
                {...mergeStyleProps(
                  themeProps('profile-search-group-label'),
                  stylex.props(reset.base, styles.groupLabel),
                )}
              >
                {page.icon ? (
                  <span
                    aria-hidden
                    {...mergeStyleProps(
                      themeProps('profile-search-group-icon'),
                      stylex.props(reset.base, styles.groupIcon),
                    )}
                  >
                    {page.icon}
                  </span>
                ) : null}
                {page.label}
              </div>
              {pageResults.map(result => (
                <Combobox.Option
                  key={result.key}
                  value={result.key}
                  label={result.label}
                >
                  <Highlight
                    text={result.label}
                    query={normalized}
                  />
                </Combobox.Option>
              ))}
            </div>
          ))}
        </Combobox.List>
      ) : null}
    </Combobox.Root>
  );
}

export interface ProfileSearchTargetProps extends MosaicComponentProps<'div'> {
  /** Matches the `id` of a section in `Profile.Nav`'s `search`. */
  id: string;
}

export const SearchTarget = React.forwardRef<HTMLDivElement, ProfileSearchTargetProps>(function ProfileSearchTarget(
  { id, xstyle, onAnimationEnd, ...rest },
  ref,
) {
  const profile = React.useContext(ProfileContext);
  const registerSearchTarget = profile?.registerSearchTarget;
  const register = React.useCallback(
    (element: HTMLDivElement | null) => registerSearchTarget?.(id, element),
    [id, registerSearchTarget],
  );
  const mergedRef = useMergeRefs([ref, register]);
  const highlighted = profile?.highlightedTarget === id;
  return (
    <div
      ref={mergedRef}
      tabIndex={-1}
      data-highlighted={highlighted ? '' : undefined}
      onAnimationEnd={event => {
        onAnimationEnd?.(event);
        if (event.target === event.currentTarget) {
          profile?.clearHighlight();
        }
      }}
      {...mergeStyleProps(
        themeProps('profile-search-target'),
        stylex.props(reset.base, styles.target, highlighted && styles.targetHighlighted, xstyle),
        rest,
      )}
    />
  );
});
