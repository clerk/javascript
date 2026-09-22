import type { ReactElement } from 'react';

import { Pagination } from '../../components/pagination';

/** The page size every members list starts at, and the smallest one its pager offers. */
export const MEMBERS_PAGE_SIZE = 10;

/**
 * Whether a list of `totalItems` rows is worth a pager. Measured against the smallest page size on
 * offer rather than the current one, so raising the page size never hides the control that set it.
 */
export function hasMembersPager(totalItems: number): boolean {
  return totalItems > MEMBERS_PAGE_SIZE;
}

export interface OrganizationProfileMembersPagerProps {
  /** The current page, 1-based. */
  page: number;
  /** How many rows are shown per page. */
  pageSize: number;
  /** The total number of rows across every page. */
  totalItems: number;
  onChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function OrganizationProfileMembersPager({
  page,
  pageSize,
  totalItems,
  onChange,
  onPageSizeChange,
}: OrganizationProfileMembersPagerProps): ReactElement {
  return (
    <Pagination
      page={page}
      totalItems={totalItems}
      pageSize={pageSize}
      onChange={onChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
