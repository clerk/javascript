import type { useOrganization } from '@clerk/shared/react';
import type { GetMembersParams } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { descriptors, Flex, localizationKeys, useLocalizations } from '@/customizables';
import { mqu } from '@/styledSystem';
import { Animated } from '@/ui/elements/Animated';
import { SearchInput } from '@/ui/elements/SearchInput';

import { ACTIVE_MEMBERS_PAGE_SIZE } from './OrganizationMembers';

type MembersSearchProps = {
  /**
   * Controlled query param state by parent component
   */
  query: GetMembersParams['query'];
  /**
   * Controlled input field value by parent component
   */
  value: string;
  /**
   * Paginated Organization memberships
   */
  memberships: ReturnType<typeof useOrganization>['memberships'];
  /**
   * Handler for change event on input field
   */
  onSearchChange: (value: string) => void;
  /**
   * Handler for `query` value changes
   */
  onQueryTrigger: (query: string) => void;
};

const membersSearchDebounceMs = 500;

export const MembersSearch = ({ query, value, memberships, onSearchChange, onQueryTrigger }: MembersSearchProps) => {
  const { t } = useLocalizations();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const eventValue = event.target.value;
    onSearchChange(eventValue);

    const shouldClearQuery = eventValue === '';
    if (shouldClearQuery) {
      onQueryTrigger(eventValue);
    }
  };

  // Debounce the input value changes until the user stops typing
  // to trigger the `query` param setter
  function handleKeyUp() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onQueryTrigger(value.trim());
    }, membersSearchDebounceMs);
  }

  const handleClear = () => {
    // Cancel any pending debounce so it can't re-trigger the query with the stale value.
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    onSearchChange('');
    onQueryTrigger('');
  };

  // If search is not performed on a initial page, resets pagination offset
  // based on the response count
  useEffect(() => {
    if (!query || !memberships?.data) {
      return;
    }

    const hasOnePageLeft = (memberships?.count ?? 0) <= ACTIVE_MEMBERS_PAGE_SIZE;
    if (hasOnePageLeft) {
      memberships?.fetchPage?.(1);
    }
  }, [query, memberships]);

  const isFetchingNewData = value && !!memberships?.isLoading && !!memberships.data?.length;

  return (
    <Animated asChild>
      <Flex
        sx={{
          width: '50%',
          [mqu.sm]: {
            width: 'auto',
          },
        }}
      >
        <SearchInput
          value={value}
          isLoading={!!isFetchingNewData}
          aria-label='Search'
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          leftIconElementDescriptor={descriptors.organizationProfileMembersSearchInputIcon}
          onKeyUp={handleKeyUp}
          onChange={handleChange}
          onClear={handleClear}
          elementDescriptor={descriptors.organizationProfileMembersSearchInput}
        />
      </Flex>
    </Animated>
  );
};
