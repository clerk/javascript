import { useOrganization } from '@clerk/shared/react';
import { useState } from 'react';

import { InputWithIcon } from '../../../ui/elements';
import { MagnifyingGlass } from '../../../ui/icons';
import { Spinner } from '../../../ui/primitives';

export const MembersSearchRow = () => {
  const [query, setQuery] = useState<string>();

  const { memberships } = useOrganization({
    memberships: {
      query,
    },
  });

  /* TODO - Only fire update once the user stops typing */
  /* TODO - Consider how it'll overlap the invite input */
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event?.target.value);
  };

  return (
    <InputWithIcon
      // TODO - Add translation keys
      placeholder='Search'
      aria-label='Search'
      leftIcon={memberships?.isFetching ? <MagnifyingGlass /> : <Spinner />}
      autoCapitalize='none'
      spellCheck={false}
      type='search'
      onChange={handleSearch}
    />
  );
};
