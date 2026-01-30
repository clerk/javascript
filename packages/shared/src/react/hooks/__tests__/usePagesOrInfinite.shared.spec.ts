import { describe, expect, it } from 'vitest';

import {
  calculateHasNextPage,
  calculateHasPreviousPage,
  calculateOffsetCount,
  calculatePageCount,
} from '../usePagesOrInfinite.shared';

describe('calculateOffsetCount', () => {
  it('returns 0 for first page', () => {
    expect(calculateOffsetCount(1, 10)).toBe(0);
    expect(calculateOffsetCount(1, 20)).toBe(0);
    expect(calculateOffsetCount(1, 1)).toBe(0);
  });

  it('returns correct offset for page 2', () => {
    expect(calculateOffsetCount(2, 10)).toBe(10);
    expect(calculateOffsetCount(2, 20)).toBe(20);
    expect(calculateOffsetCount(2, 5)).toBe(5);
  });

  it('returns correct offset for higher pages', () => {
    expect(calculateOffsetCount(3, 10)).toBe(20);
    expect(calculateOffsetCount(5, 10)).toBe(40);
    expect(calculateOffsetCount(10, 25)).toBe(225);
  });
});

describe('calculatePageCount', () => {
  it('returns exact page count when items divide evenly', () => {
    expect(calculatePageCount(100, 0, 10)).toBe(10);
    expect(calculatePageCount(50, 0, 25)).toBe(2);
    expect(calculatePageCount(20, 0, 5)).toBe(4);
  });

  it('rounds up when items do not divide evenly', () => {
    expect(calculatePageCount(95, 0, 10)).toBe(10);
    expect(calculatePageCount(101, 0, 10)).toBe(11);
    expect(calculatePageCount(1, 0, 10)).toBe(1);
  });

  it('accounts for offset in page count', () => {
    // 100 total - 20 offset = 80 items, 80/10 = 8 pages
    expect(calculatePageCount(100, 20, 10)).toBe(8);
    // 37 total - 10 offset = 27 items, 27/5 = 5.4, rounds to 6 pages
    expect(calculatePageCount(37, 10, 5)).toBe(6);
  });

  it('returns 0 when total equals offset', () => {
    expect(calculatePageCount(20, 20, 10)).toBe(0);
  });

  it('returns negative value when offset exceeds total (edge case)', () => {
    // This is an edge case that shouldn't happen in practice
    expect(calculatePageCount(10, 20, 10)).toBe(-1);
  });
});

describe('calculateHasNextPage', () => {
  it('returns true when there are more items', () => {
    // 100 items, no offset, page 1, 10 per page -> 90 more items
    expect(calculateHasNextPage(100, 0, 1, 10)).toBe(true);
    // 100 items, no offset, page 9, 10 per page -> 10 more items
    expect(calculateHasNextPage(100, 0, 9, 10)).toBe(true);
  });

  it('returns false on last page', () => {
    // 100 items, no offset, page 10, 10 per page -> exactly at the end
    expect(calculateHasNextPage(100, 0, 10, 10)).toBe(false);
    // 20 items, no offset, page 2, 10 per page -> exactly at the end
    expect(calculateHasNextPage(20, 0, 2, 10)).toBe(false);
  });

  it('returns false when past the last page', () => {
    expect(calculateHasNextPage(100, 0, 11, 10)).toBe(false);
  });

  it('accounts for offset correctly', () => {
    // 100 items, 20 offset (2 pages), page 8 of remaining, 10 per page
    // 100 - 20 = 80 remaining, page 8 * 10 = 80 consumed, no more
    expect(calculateHasNextPage(100, 20, 8, 10)).toBe(false);
    // Same but page 7: 70 consumed, 10 more items remaining
    expect(calculateHasNextPage(100, 20, 7, 10)).toBe(true);
  });

  it('handles edge case with partial last page', () => {
    // 25 items, no offset, page 2, 10 per page -> 5 more items on page 3
    expect(calculateHasNextPage(25, 0, 2, 10)).toBe(true);
    // 25 items, no offset, page 3, 10 per page -> no more items
    expect(calculateHasNextPage(25, 0, 3, 10)).toBe(false);
  });

  it('handles single page scenarios', () => {
    expect(calculateHasNextPage(5, 0, 1, 10)).toBe(false);
    expect(calculateHasNextPage(10, 0, 1, 10)).toBe(false);
    expect(calculateHasNextPage(11, 0, 1, 10)).toBe(true);
  });
});

describe('calculateHasPreviousPage', () => {
  it('returns false on first page with no offset', () => {
    expect(calculateHasPreviousPage(1, 10, 0)).toBe(false);
  });

  it('returns true when there are previous pages', () => {
    expect(calculateHasPreviousPage(2, 10, 0)).toBe(true);
    expect(calculateHasPreviousPage(5, 10, 0)).toBe(true);
    expect(calculateHasPreviousPage(100, 10, 0)).toBe(true);
  });

  it('accounts for offset correctly', () => {
    // Page 1 with offset 10 (1 page skipped) -> no previous within visible range
    // (1-1)*10 = 0, 0 > 10 = false
    expect(calculateHasPreviousPage(1, 10, 10)).toBe(false);
    // Page 2 with offset 10 -> (2-1)*10 = 10, 10 > 10 = false (exactly at boundary)
    expect(calculateHasPreviousPage(2, 10, 10)).toBe(false);
    // Page 3 with offset 10 -> (3-1)*10 = 20, 20 > 10 = true
    expect(calculateHasPreviousPage(3, 10, 10)).toBe(true);
  });

  it('handles edge case where page 1 items exactly match offset', () => {
    // Page 1, 10 items per page, offset 0 -> (1-1)*10 = 0, 0 > 0 = false
    expect(calculateHasPreviousPage(1, 10, 0)).toBe(false);
    // Page 2, 10 items per page, offset 10 -> (2-1)*10 = 10, 10 > 10 = false
    expect(calculateHasPreviousPage(2, 10, 10)).toBe(false);
    // Page 3, 10 items per page, offset 10 -> (3-1)*10 = 20, 20 > 10 = true
    expect(calculateHasPreviousPage(3, 10, 10)).toBe(true);
  });

  it('works with different page sizes', () => {
    expect(calculateHasPreviousPage(1, 5, 0)).toBe(false);
    expect(calculateHasPreviousPage(2, 5, 0)).toBe(true);
    expect(calculateHasPreviousPage(1, 100, 0)).toBe(false);
    expect(calculateHasPreviousPage(2, 100, 0)).toBe(true);
  });
});

describe('pagination utilities integration', () => {
  it('correctly calculates pagination state for a typical scenario', () => {
    // Scenario: 42 total items, starting at page 2, 5 items per page
    const initialPage = 2;
    const pageSize = 5;
    const totalCount = 42;

    const offsetCount = calculateOffsetCount(initialPage, pageSize);
    expect(offsetCount).toBe(5); // Skip first 5 items

    const pageCount = calculatePageCount(totalCount, offsetCount, pageSize);
    expect(pageCount).toBe(8); // (42-5)/5 = 7.4 -> 8 pages

    // On page 2 (first visible page)
    expect(calculateHasNextPage(totalCount, offsetCount, 2, pageSize)).toBe(true);
    expect(calculateHasPreviousPage(2, pageSize, offsetCount)).toBe(false);

    // On page 5 (middle)
    expect(calculateHasNextPage(totalCount, offsetCount, 5, pageSize)).toBe(true);
    expect(calculateHasPreviousPage(5, pageSize, offsetCount)).toBe(true);

    // On page 9 (last page, since we have 8 pages starting from page 2)
    expect(calculateHasNextPage(totalCount, offsetCount, 9, pageSize)).toBe(false);
    expect(calculateHasPreviousPage(9, pageSize, offsetCount)).toBe(true);
  });

  it('handles edge case with initialPage=1 (no offset)', () => {
    const initialPage = 1;
    const pageSize = 10;
    const totalCount = 100;

    const offsetCount = calculateOffsetCount(initialPage, pageSize);
    expect(offsetCount).toBe(0);

    const pageCount = calculatePageCount(totalCount, offsetCount, pageSize);
    expect(pageCount).toBe(10);

    // First page
    expect(calculateHasNextPage(totalCount, offsetCount, 1, pageSize)).toBe(true);
    expect(calculateHasPreviousPage(1, pageSize, offsetCount)).toBe(false);

    // Last page
    expect(calculateHasNextPage(totalCount, offsetCount, 10, pageSize)).toBe(false);
    expect(calculateHasPreviousPage(10, pageSize, offsetCount)).toBe(true);
  });
});
