import { useState } from 'react';

export function useProfilePagesController(
  initialPage: string,
  pageIds: readonly string[] | undefined,
  openingFallbackPage?: string,
) {
  const [activePage, setActivePage] = useState(initialPage);
  const [isOpening, setIsOpening] = useState(true);

  if (pageIds) {
    if (isOpening) {
      setIsOpening(false);
    }
    const fallbackPage = (isOpening ? openingFallbackPage : undefined) ?? pageIds[0];
    if (fallbackPage !== undefined && !pageIds.includes(activePage)) {
      setActivePage(fallbackPage);
    }
  }

  return { activePage, onPageChange: setActivePage };
}
