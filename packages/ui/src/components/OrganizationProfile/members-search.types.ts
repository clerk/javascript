export type MembersSearchProps = {
  /**
   * Controlled query param state by parent component
   */
  query: string | undefined;
  /**
   * Controlled input field value by parent component
   */
  value: string;
  /**
   * Paginated Organization memberships
   */
  memberships: MembersSearchQueryData;
  /**
   * Handler for change event on input field
   */
  onSearchChange: (value: string) => void;
  /**
   * Handler for `query` value changes
   */
  onQueryTrigger: (query: string) => void;
};

export type MembersSearchQueryData = {
  page: number;
  hasData: boolean;
  count: number;
  isLoading: boolean;
  hasRows: boolean;
  fetchPage: (page: number) => void;
};

export type MembersSearchData = {
  value: string;
  isLoading: boolean;
  handleChange: (value: string) => void;
  handleClear: () => void;
};
