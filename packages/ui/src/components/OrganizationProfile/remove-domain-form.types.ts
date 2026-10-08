export type RemoveDomainFormModel = {
  scope: string;
  canRun: () => boolean;
  available: boolean;
  isLoading: boolean;
  errorMessage?: string;
  retry: () => void;
  domainName: string;
  deleteDomain: (canContinue?: () => boolean) => Promise<boolean>;
};
