import { act, fireEvent, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { useMembersSearchController } from '../members-search.controller';
import type { MembersSearchProps, MembersSearchQueryData } from '../members-search.types';
import { MembersSearch } from '../MembersSearch';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

function props(overrides: Partial<MembersSearchProps> = {}): MembersSearchProps {
  return {
    value: '',
    query: '',
    memberships: { page: 1, hasData: true, count: 0, hasRows: false, isLoading: false, fetchPage: vi.fn() },
    onSearchChange: vi.fn(),
    onQueryTrigger: vi.fn(),
    ...overrides,
  };
}

describe('Member search', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('submits only the latest trimmed value after input changes', () => {
    const input = props();
    const { result } = renderHook(() => useMembersSearchController(input, 10));
    act(() => result.current.handleChange('first'));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => result.current.handleChange('  second  '));
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(input.onQueryTrigger).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(input.onSearchChange).toHaveBeenLastCalledWith('  second  ');
    expect(input.onQueryTrigger).toHaveBeenCalledExactlyOnceWith('second');
  });

  it.each(['empty', 'clear'])('cancels an old query when the input is %s', mode => {
    const input = props();
    const { result } = renderHook(() => useMembersSearchController(input, 10));
    act(() => result.current.handleChange('old query'));
    act(() => {
      if (mode === 'clear') {
        result.current.handleClear();
      } else {
        result.current.handleChange('');
      }
    });
    expect(input.onQueryTrigger).toHaveBeenCalledExactlyOnceWith('');
    expect(input.onSearchChange).toHaveBeenLastCalledWith('');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(input.onQueryTrigger).toHaveBeenCalledTimes(1);
  });

  it('disposes pending work and rejects retained handlers after unmount', () => {
    const input = props();
    const { result, unmount } = renderHook(() => useMembersSearchController(input, 10));
    const handlers = result.current;
    act(() => handlers.handleChange('pending'));
    unmount();
    act(() => {
      handlers.handleChange('late');
      handlers.handleClear();
      vi.advanceTimersByTime(500);
    });
    expect(input.onSearchChange).toHaveBeenCalledExactlyOnceWith('pending');
    expect(input.onQueryTrigger).not.toHaveBeenCalled();
  });

  it('resets an out-of-range search page once the result count fits one page', () => {
    const input = props({ query: 'name' });
    const { rerender } = renderHook(
      (memberships: MembersSearchQueryData) => useMembersSearchController({ ...input, memberships }, 10),
      { initialProps: { ...input.memberships, page: 3, count: 21 } },
    );
    expect(input.memberships.fetchPage).not.toHaveBeenCalled();
    rerender({ ...input.memberships, page: 3, count: 10 });
    expect(input.memberships.fetchPage).toHaveBeenCalledExactlyOnceWith(1);
    rerender({ ...input.memberships, page: 1, count: 10 });
    expect(input.memberships.fetchPage).toHaveBeenCalledTimes(1);
  });

  it('does not reset pagination without a completed search result', () => {
    const input = props({ memberships: { ...props().memberships, page: 3 } });
    const { rerender } = renderHook((value: MembersSearchProps) => useMembersSearchController(value, 10), {
      initialProps: input,
    });
    rerender({ ...input, query: 'name', memberships: { ...input.memberships, hasData: false } });
    expect(input.memberships.fetchPage).not.toHaveBeenCalled();
  });

  it('renders the controlled search and submits replacement text without a key event', async () => {
    const { wrapper } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const input = props();
    function Search() {
      const [value, setValue] = useState('');
      return (
        <MembersSearch
          {...input}
          value={value}
          onSearchChange={setValue}
        />
      );
    }
    const { getByRole } = render(<Search />, { wrapper });
    const search = getByRole('searchbox', { name: 'Search' });
    expect(search).toHaveAttribute('placeholder', 'Search');
    expect(search).toHaveClass('cl-organizationProfileMembersSearchInput');
    fireEvent.change(search, { target: { value: ' pasted name ' } });
    expect(search).toHaveValue(' pasted name ');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(input.onQueryTrigger).toHaveBeenCalledExactlyOnceWith('pasted name');
    fireEvent.click(getByRole('button', { name: 'Clear search' }));
    expect(search).toHaveValue('');
    expect(input.onQueryTrigger).toHaveBeenLastCalledWith('');
  });
});
