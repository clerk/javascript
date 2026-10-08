export type CreditAmount = {
  amount: number;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
};

export type AccountCreditsViewProps = {
  balance: CreditAmount;
  localizationRoot: 'userProfile' | 'organizationProfile';
  onViewHistory: () => void;
};

export type AccountCreditsModel = { status: 'hidden' } | ({ status: 'ready' } & AccountCreditsViewProps);

export type CreditHistoryViewProps = {
  status: 'loading' | 'ready';
  localizationRoot: 'userProfile' | 'organizationProfile';
  entries: { id: string; amount: CreditAmount; createdAt: number }[];
  onBack: () => void;
};
