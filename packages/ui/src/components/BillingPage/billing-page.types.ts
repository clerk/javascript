export type BillingPageData = {
  subscriberType: 'user' | 'organization';
  error: string | undefined;
  selectedTab: number;
  handleTabChange: (index: number) => void;
};
