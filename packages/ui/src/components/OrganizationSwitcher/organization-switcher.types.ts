export type OrganizationSwitcherRootData = {
  standalone: boolean | ((open: boolean) => void) | undefined;
  defaultOpen: boolean | undefined;
};

export type OrganizationSwitcherTriggerData = {
  isVisible: boolean;
  hidePersonal: boolean;
  organization: { id: string; name: string; slug: string | null; imageUrl: string; hasImage: boolean } | undefined;
  user: { firstName: string | null; lastName: string | null; imageUrl: string } | undefined;
  ariaLabel: string;
};
