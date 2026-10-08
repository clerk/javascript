export type StatementsListData = {
  isLoading: boolean;
  count: number;
  localizationRoot: 'userProfile' | 'organizationProfile';
  rows: { id: string; date: string; amount: string; onClick: () => void }[];
};

export type StatementItemData = {
  id: string;
  planName: string;
  planPeriod: 'month' | 'annual';
  chargeType: 'checkout' | 'recurring';
  description: string;
  amount: string;
  prorationValue: string | null;
  discount: { label: string; value: string } | null;
  creditProrationValue: string | null;
  payerCreditValue: string | null;
};

export type StatementData = {
  id: string;
  status: 'open' | 'closed';
  title: string;
  totalPaid: string;
  sections: { id: string; title: string; items: StatementItemData[] }[];
};

export type StatementPageData = {
  isLoading: boolean;
  localizationRoot: 'userProfile' | 'organizationProfile';
  errorText: string | undefined;
  statement: StatementData | null;
  onBack: () => void;
  onPaymentAttempt: (id: string) => void;
};

export type StatementCopyButtonData = {
  onCopy: () => void;
  hasCopied: boolean;
  copyLabel: string;
};
