import { useEffect, useRef, useState } from 'react';

import { Flex, localizationKeys, useLocalizations } from '../../../ui/customizables';
import { Animated, InputWithIcon } from '../../../ui/elements';
import { MagnifyingGlass } from '../../../ui/icons';
import { Spinner } from '../../../ui/primitives';

type MembersSearchProps = {
  isLoading: boolean;
  onChange: (query: string) => void;
  debounceMs?: number;
};

export const MembersSearch = ({ isLoading, onChange, debounceMs = 500 }: MembersSearchProps) => {
  const { t } = useLocalizations();
  const [search, setSearch] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Updates query state to trigger change handler only once user stops typing
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
          onChange(search.trim());
        }, debounceMs);
      },
      {
        signal: controller.signal,
      },
    );

    return () => {
      controller.abort();
    };
  }, [search, debounceMs, onChange]);

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
          leftIcon={isLoading ? <Spinner /> : <MagnifyingGlass />}
          onChange={handleChange}
          containerSx={{ width: '100%' }}
        />
      </Flex>
    </Animated>
  );
};
