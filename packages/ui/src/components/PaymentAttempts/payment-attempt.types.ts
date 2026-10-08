export type PaymentAttemptStatus = 'pending' | 'paid' | 'failed';

export type PaymentAttemptsListData = {
  isLoading: boolean;
  count: number;
  localizationRoot: 'userProfile' | 'organizationProfile';
  rows: { id: string; date: string; amount: string; status: PaymentAttemptStatus; onClick: () => void }[];
};

export type PaymentAttemptData = {
  id: string;
  title: string;
  status: PaymentAttemptStatus;
  currency: string;
  total: string;
  planName: string;
  isAnnual: boolean;
  fee: string;
  seats: {
    planSeatLimit: number | null;
    totalSeats: number;
    included: number;
    chargeable: number;
    rate: string;
    total: string;
  } | null;
  subtotal: string;
  proration: string | null;
  catalogDiscount: { name: string; description: string; promoCode: string | undefined; amount: string } | null;
  creditProration: string | null;
  payerCredit: string | null;
};

export type PaymentAttemptPageData = {
  isLoading: boolean;
  localizationRoot: 'userProfile' | 'organizationProfile';
  errorText: string | undefined;
  attempt: PaymentAttemptData | null;
  onBack: () => void;
};

export type PaymentAttemptCopyData = {
  onCopy: () => void;
  hasCopied: boolean;
  copyLabel: string;
};
