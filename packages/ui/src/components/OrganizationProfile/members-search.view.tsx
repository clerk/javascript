import { descriptors, Flex, localizationKeys, useLocalizations } from '@/customizables';
import { mqu } from '@/styledSystem';
import { Animated } from '@/ui/elements/Animated';
import { SearchInput } from '@/ui/elements/SearchInput';

import type { MembersSearchData } from './members-search.types';

export const MembersSearchView = ({ data }: { data: MembersSearchData }) => {
  const { t } = useLocalizations();
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
          value={data.value}
          isLoading={data.isLoading}
          aria-label='Search'
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          leftIconElementDescriptor={descriptors.organizationProfileMembersSearchInputIcon}
          onChange={event => data.handleChange(event.target.value)}
          onClear={data.handleClear}
          elementDescriptor={descriptors.organizationProfileMembersSearchInput}
        />
      </Flex>
    </Animated>
  );
};
