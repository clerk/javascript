import { useOrganization } from '@clerk/shared/react';
import { useState } from 'react';

import { Flex, localizationKeys, useLocalizations } from '../../../ui/customizables';
import { Animated, InputWithIcon } from '../../../ui/elements';
import { useDebounce } from '../../../ui/hooks';
import { MagnifyingGlass } from '../../../ui/icons';
import { Spinner } from '../../../ui/primitives';

export const MembersSearch = () => {
  const { t } = useLocalizations();
  const [search, setSearch] = useState('');
  const query = useDebounce(search, 500);

  const { memberships } = useOrganization({
    memberships: {
      query,
    },
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <Animated asChild>
      <Flex sx={{ width: '100%' }}>
        <InputWithIcon
          type='search'
          autoCapitalize='none'
          spellCheck={false}
          aria-label='Search'
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          leftIcon={memberships?.isFetching ? <Spinner /> : <MagnifyingGlass />}
          onChange={handleSearch}
          containerSx={{ width: '100%' }}
        />
      </Flex>
    </Animated>
  );
};
