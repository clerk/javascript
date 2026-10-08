import { useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';

export const useOrganizationMembersController = () => {
  const card = useCardState();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  return { query, search, setQuery, setSearch, error: card.error };
};
