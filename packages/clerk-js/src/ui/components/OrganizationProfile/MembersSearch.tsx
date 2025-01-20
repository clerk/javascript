import { useOrganization } from '@clerk/shared/react';
import { useEffect, useRef, useState } from 'react';

import { Flex, localizationKeys, useLocalizations } from '../../../ui/customizables';
import { Animated, InputWithIcon } from '../../../ui/elements';
import { MagnifyingGlass } from '../../../ui/icons';
import { Spinner } from '../../../ui/primitives';

export const MembersSearch = () => {
  const { t } = useLocalizations();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>();

  const { memberships } = useOrganization({
    memberships: {
      query,
    },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Updates query state to trigger query only once user stops typing
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
          setQuery(search);
        }, 500);
      },
      {
        signal: controller.signal,
      },
    );

    return () => {
      controller.abort();
    };
  }, [search]);

  return (
    <Animated asChild>
      <Flex sx={{ width: '100%' }}>
        <InputWithIcon
          ref={inputRef}
          type='search'
          autoCapitalize='none'
          spellCheck={false}
          aria-label='Search'
          placeholder={t(localizationKeys('organizationProfile.membersPage.action__search'))}
          leftIcon={memberships?.isFetching ? <Spinner /> : <MagnifyingGlass />}
          onChange={handleChange}
          containerSx={{ width: '100%' }}
        />
      </Flex>
    </Animated>
  );
};
