export type OrganizationSwitcherMembershipData = {
  isVisible: boolean;
  hidePersonal: boolean;
  showPersonal: boolean;
  personalPreview: { firstName: string | null; lastName: string | null; imageUrl: string } | undefined;
  organizations: {
    id: string;
    preview: { id: string; name: string; slug: string | null; imageUrl: string; hasImage: boolean };
    onClick: () => unknown;
  }[];
  isLoading: boolean;
  hasNextPage: boolean;
  paginationRef: (node: HTMLElement | null) => void;
};
