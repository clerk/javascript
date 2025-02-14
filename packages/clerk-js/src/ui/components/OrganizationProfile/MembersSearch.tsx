import type { useOrganization } from '@clerk/shared/react';
import type { GetMembersParams } from '@clerk/types';
import { useEffect } from 'react';

import { descriptors, Flex, Icon, localizationKeys, useLocalizations } from '../../../ui/customizables';
import { InputWithIcon } from '../../../ui/elements';
import { Field } from '../../../ui/elements/FieldControl';
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
   * Paginated organization memberships
   */
  memberships: ReturnType<typeof useOrganization>['memberships'];
  /**
   * Handler for value changes
   */
  onChange: (query: string) => void;
  /**
   * Minimum search length to trigger query
   */
  minLength: number;
};

export const MembersSearch = ({ memberships, onChange, minLength }: MembersSearchProps) => {
  const { t } = useLocalizations();
  const searchField = useFormControl('search', '', {
    type: 'search',
    label: '',
    placeholder: localizationKeys('organizationProfile.membersPage.action__search'),
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();

    searchField.onChange(event);
    onChange(value);

    if (value.length >= minLength) {
      searchField.clearFeedback();
      return;
    }

    searchField.setInfo(t(localizationKeys('organizationProfile.membersPage.action__search_minLength')));
  };

  // If search is not performed on a initial page, resets pagination offset
  // based on the response count
  useEffect(() => {
    if (!searchField.value || !memberships?.data) {
      return;
    }

    const hasOnePageLeft = (memberships?.count ?? 0) <= ACTIVE_MEMBERS_PAGE_SIZE;
    if (hasOnePageLeft) {
      memberships?.fetchPage?.(1);
    }
  }, [searchField.value, memberships]);

  const isFetchingNewData = searchField.value && !!memberships?.isLoading && !!memberships.data?.length;

  return (
    <Flex
      sx={{ minWidth: '50%', position: 'relative' }}
      direction='col'
    >
      <Field.Root {...searchField}>
        <InputWithIcon
          {...searchField.props}
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
          onChange={handleChange}
          elementDescriptor={descriptors.organizationProfileMembersSearchInput}
        />

        <Field.Feedback />
      </Field.Root>
    </Flex>
  );
};
