import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { MagnifyingGlass } from '../../icons/glyphs/magnifying-glass';
import { X } from '../../icons/glyphs/x';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { Button } from '../button';
import { Combobox } from '../combobox';
import { Icon } from '../icon';
import { InputGroup } from '../input-group';
import { styles } from './profile-search.styles';
import { type IndexedTarget, type ProfileSearchState, useSearchIndex } from './profile-search-index';

/** A page the profile's search lists, found by its `label` or `keywords`. */
export interface ProfileSearchPage {
  /** The `value` of the page's `Profile.NavItem`. */
  value: string;
  label: string;
  icon?: React.ReactNode;
  keywords?: readonly string[];
}

export function ProfileSearch({ pages, search }: { pages: readonly ProfileSearchPage[]; search: ProfileSearchState }) {
  const m = useMessages('profile');
  const { query, setQuery, setFocused, indexContainer, revealResult } = search;
  const index = useSearchIndex(indexContainer);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const groupId = React.useId();
  const normalized = query.trim().toLocaleLowerCase();
  const groups = normalized ? matchesOf(pages, index, normalized) : [];
  const results = new Map(groups.flatMap(group => group.results.map(result => [result.key, result] as const)));

  React.useEffect(
    () => () => {
      setQuery('');
      setFocused(false);
    },
    [setQuery, setFocused],
  );

  return (
    <Combobox.Root
      inline
      open={normalized !== ''}
      value={null}
      inputValue={query}
      onInputValueChange={setQuery}
      onValueChange={key => {
        const result = key === null ? undefined : results.get(key);
        if (result) {
          revealResult(result.page, result.target);
        }
      }}
    >
      <InputGroup.Root
        xstyle={styles.search}
        {...themeProps('profile-search')}
      >
        <InputGroup.Start>
          <Icon glyph={MagnifyingGlass} />
        </InputGroup.Start>
        <Combobox.Input
          ref={inputRef}
          type='search'
          autoComplete='off'
          aria-label={m.search.label}
          placeholder={m.search.label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={event => {
            if (event.key === 'Escape' && query !== '') {
              event.stopPropagation();
              setQuery('');
            }
          }}
        />
        {query ? (
          <InputGroup.End>
            <Button
              type='button'
              aria-label={m.search.clear}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <Icon glyph={X} />
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

interface Result {
  key: string;
  label: string;
  page: string;
  target: string | null;
}

function matchesOf(pages: readonly ProfileSearchPage[], index: readonly IndexedTarget[], query: string) {
  const matches = (label: string, keywords: readonly string[] = []) =>
    [label, ...keywords].some(text => text.toLocaleLowerCase().includes(query));
  return pages
    .map(page => {
      const results: Result[] = [];
      if (matches(page.label, page.keywords)) {
        results.push({ key: JSON.stringify([page.value]), label: page.label, page: page.value, target: null });
      }
      for (const entry of index) {
        if (entry.page === page.value && matches(entry.label, entry.keywords)) {
          results.push({
            key: JSON.stringify([page.value, entry.target]),
            label: entry.label,
            page: page.value,
            target: entry.target,
          });
        }
      }
      return { page, results };
    })
    .filter(group => group.results.length > 0);
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
