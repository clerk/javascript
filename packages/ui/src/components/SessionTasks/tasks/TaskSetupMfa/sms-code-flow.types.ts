type CanContinue = () => boolean;

export type SmsVerificationModel = {
  scopeKey: string;
  canRun: () => boolean;
  phoneId: string | undefined;
  phoneNumber: string;
  prepare: (canContinue?: CanContinue) => Promise<boolean>;
  attempt: (code: string, canContinue?: CanContinue) => Promise<boolean>;
  enableMfa: (canContinue?: CanContinue) => Promise<boolean>;
};

export type SmsCodeFlowModel = {
  scopeKey: string;
  canRun: () => boolean;
  hasUser: boolean;
  username: string | null | undefined;
  hasAvailablePhones: boolean;
  phones: Array<{ id: string; isVerified: boolean; flag: string; formattedPhone: string }>;
  backupCodes: string[] | undefined;
  createPhone: (phoneNumber: string, canContinue?: CanContinue) => Promise<boolean>;
  selectUnverifiedPhone: (id: string) => boolean;
  enableVerifiedPhone: (id: string, canContinue?: CanContinue) => Promise<boolean>;
  verification: SmsVerificationModel;
};
