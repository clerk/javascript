export type TotpCreationResult =
  | { status: 'created'; totp: { uri: string | undefined; secret: string | undefined } }
  | { status: 'cancelled' | 'stale' };

export type TotpCreationModel = {
  scopeKey: string;
  canRun: () => boolean;
  canCreate: boolean;
  create: (canContinue?: () => boolean) => Promise<TotpCreationResult>;
};

export type TotpVerificationModel = {
  scopeKey: string;
  canRun: () => boolean;
  verifyCode: (code: string, canContinue?: () => boolean) => Promise<boolean>;
};

export type TotpCodeFlowModel = {
  scopeKey: string;
  canRun: () => boolean;
  creation: TotpCreationModel;
  verification: TotpVerificationModel;
  backupCodes: string[] | undefined;
};
