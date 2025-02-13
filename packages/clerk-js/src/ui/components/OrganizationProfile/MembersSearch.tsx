import type { useOrganization } from '@clerk/shared/react';
import type { GetMembersParams } from '@clerk/types';
import { useEffect } from 'react';

import { descriptors, Flex, Icon, localizationKeys, useLocalizations } from '../../../ui/customizables';
import { InputWithIcon } from '../../../ui/elements';
import { Field } from '../../../ui/elements/FieldControl';
import { useDebounce } from '../../../ui/hooks';
import { MagnifyingGlass } from '../../../ui/icons';
import { Spinner } from '../../../ui/primitives';
import { useFormControl } from '../../../ui/utils';
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
  onQueryChange: (query: string) => void;
  /**
   * Minimum search length to trigger query
   */
  minLength: number;
};

export const MembersSearch = ({ value, memberships, onSearchChange, onQueryChange, minLength }: MembersSearchProps) => {
  const { t } = useLocalizations();
  const searchField = useFormControl('search', '', {
    type: 'search',
    label: '',
    placeholder: localizationKeys('organizationProfile.membersPage.action__search'),
  });
  const query = useDebounce(value, 600);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const eventValue = event.target.value;
    onSearchChange(eventValue);

    if (!eventValue || eventValue.length < minLength) {
      searchField.setInfo('3 character minimum');
      return;
    }

    searchField.clearFeedback();
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

  useEffect(() => {
    onQueryChange(query);
  }, [query, onQueryChange]);

  const isFetchingNewData = value && !!memberships?.isLoading && !!memberships.data?.length;

  return (
    <Flex
      sx={{ minWidth: '50%', position: 'relative' }}
      direction='col'
    >
      <Field.Root {...searchField}>
        <InputWithIcon
          {...searchField.props}
          value={value}
          type='search'
          autoCapitalize='none'
          spellCheck={false}
          aria-label='Search'
          minLength={minLength}
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          leftIcon={
            isFetchingNewData ? (
              <Spinner size='xs' />
            ) : (
              <Icon
                icon={MagnifyingGlass}
                elementDescriptor={descriptors.organizationProfileMembersSearchInputIcon}
              />
            )
          }
          onKeyUp={handleKeyUp}
          onChange={handleChange}
          elementDescriptor={descriptors.organizationProfileMembersSearchInput}
        />

        <Field.Feedback />
      </Field.Root>
    </Flex>
  );
};
