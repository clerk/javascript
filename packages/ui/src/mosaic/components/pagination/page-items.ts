export type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

function range(start: number, end: number): number[] {
  const pages: number[] = [];
  for (let page = start; page <= end; page++) {
    pages.push(page);
  }
  return pages;
}

export function getPageItems(page: number, pageCount: number, siblingCount: number): PageItem[] {
  if (pageCount <= 1) {
    return [1];
  }

  const windowStart = Math.max(Math.min(page - siblingCount, pageCount - 2 * siblingCount - 2), 3);
  const windowEnd = Math.min(Math.max(page + siblingCount, 2 * siblingCount + 3), pageCount - 2);

  const items: PageItem[] = [1];
  if (windowStart > 3) {
    items.push('start-ellipsis');
  } else if (pageCount > 3) {
    items.push(2);
  }
  items.push(...range(windowStart, windowEnd));
  if (windowEnd < pageCount - 2) {
    items.push('end-ellipsis');
  } else if (pageCount > 2) {
    items.push(pageCount - 1);
  }
  items.push(pageCount);
  return items;
}
