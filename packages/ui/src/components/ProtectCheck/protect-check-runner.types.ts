export type ProtectCheckChallenge = {
  status: 'pending';
  token: string;
  sdkUrl: string;
  expiresAt?: number;
  uiHints?: Record<string, string>;
};

export type ProtectCheckCompletion = (isCancelled: () => boolean) => Promise<unknown>;

export type ProtectCheckRunnerParams = {
  getProtectCheck: () => ProtectCheckChallenge | null | undefined;
  getCompletion: () => ProtectCheckCompletion;
  reload: () => Promise<void>;
  submitProof: (proofToken: string) => Promise<ProtectCheckCompletion>;
  onError?: (error: unknown) => void;
};

export type ProtectCheckFlowModel = {
  hasProtectCheck: boolean;
  navigateToFlowStart: () => unknown;
  runner: ProtectCheckRunnerParams;
  protectCheckConfig: { loadTimeoutMs: number | undefined };
};

export type SignUpProtectCheckPaths = {
  verifyEmailPath: string;
  verifyPhonePath: string;
  continuePath: string;
  protectCheckPath: string;
};
