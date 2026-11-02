import { useState } from 'react';

export function useProfilePagesController(initialPage: string, pageIds: readonly string[] | undefined) {
  const [activePage, setActivePage] = useState(initialPage);

  if (pageIds) {
    const [firstPage] = pageIds;
    if (firstPage !== undefined && !pageIds.includes(activePage)) {
      setActivePage(firstPage);
    }
  }

  return { activePage, onPageChange: setActivePage };
}
