import { useOrganization } from '@clerk/shared/react';
import { useState } from 'react';

import { Flex, localizationKeys, useLocalizations } from '../../../ui/customizables';
import { Animated, InputWithIcon } from '../../../ui/elements';
import { MagnifyingGlass } from '../../../ui/icons';
import { Spinner } from '../../../ui/primitives';

export const MembersSearch = () => {
  const [query, setQuery] = useState<string>();
  const { t } = useLocalizations();

  const { memberships } = useOrganization({
    memberships: {
      query,
    },
  });

  /* TODO - Only fire update once the user stops typing */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event?.target.value);
  };

  return (
    <Animated asChild>
      <Flex sx={{ width: '100%', '& div': { width: '100%' } }}>
        <InputWithIcon
          type='search'
          autoCapitalize='none'
          spellCheck={false}
          aria-label='Search'
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          leftIcon={memberships?.isFetching ? <Spinner /> : <MagnifyingGlass />}
          onChange={handleSearch}
        />
      </Flex>
    </Animated>
  );
};
