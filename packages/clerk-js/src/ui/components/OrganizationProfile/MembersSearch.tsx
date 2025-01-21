import type { useOrganization } from '@clerk/shared/react';
import type { GetMembersParams } from '@clerk/types';
import { useEffect, useRef } from 'react';

import { Flex, localizationKeys, useLocalizations } from '../../../ui/customizables';
import { Animated, InputWithIcon } from '../../../ui/elements';
import { MagnifyingGlass } from '../../../ui/icons';
import { Spinner } from '../../../ui/primitives';
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
   * Paginated organization memberships
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

  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onSearchChange(value);

    const shouldClearQuery = value === '';
    if (shouldClearQuery) {
      onQueryTrigger(value);
    }
  };

  // Debounce the input value changes until the user stops typing
  // to trigger the `query` param setter
  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    const controller = new AbortController();

    inputRef.current.addEventListener(
      'keyup',
      () => {
        clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
          onQueryTrigger(value.trim());
        }, membersSearchDebounceMs);
      },
      {
        signal: controller.signal,
      },
    );

    return () => {
      controller.abort();
    };
  }, [value, onQueryTrigger]);

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
      <Flex sx={{ width: '100%' }}>
        <InputWithIcon
          value={value}
          ref={inputRef}
          type='search'
          autoCapitalize='none'
          spellCheck={false}
          aria-label='Search'
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          leftIcon={isFetchingNewData ? <Spinner /> : <MagnifyingGlass />}
          onChange={handleChange}
          containerSx={{ width: '100%' }}
        />
      </Flex>
    </Animated>
  );
};
