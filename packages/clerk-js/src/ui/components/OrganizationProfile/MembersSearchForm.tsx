import type { useOrganization } from '@clerk/shared/react';
import type { GetMembersParams } from '@clerk/types';
import { useEffect } from 'react';

import { sanitizeInputProps } from '../../../ui/primitives/hooks';
import { descriptors, Flex, Icon, localizationKeys, useLocalizations } from '../../customizables';
import { InputWithIcon } from '../../elements';
import { Field } from '../../elements/FieldControl';
import { MagnifyingGlass } from '../../icons';
import { Spinner } from '../../primitives';
import { useFormControl } from '../../utils';
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

export const MembersSearchForm = ({ memberships, onChange, minLength }: MembersSearchProps) => {
  const { t } = useLocalizations();
  const searchField = useFormControl('search', '', {
    type: 'search',
    label: '',
    placeholder: localizationKeys('organizationProfile.membersPage.action__search'),
  });
  const { placeholder, ...inputProps } = sanitizeInputProps(searchField);

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
      elementDescriptor={descriptors.organizationProfileMembersSearchContainer}
    >
      <Field.Root {...searchField}>
        <InputWithIcon
          type='search'
          spellCheck={false}
          aria-label='Search'
          autoCapitalize='none'
          minLength={minLength}
          onFocus={inputProps.onFocus}
          onBlur={inputProps.onBlur}
          onChange={handleChange}
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          elementDescriptor={descriptors.organizationProfileMembersSearchInput}
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
        />

        <Field.Feedback />
      </Field.Root>
    </Flex>
  );
};
