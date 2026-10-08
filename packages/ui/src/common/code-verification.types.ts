export type CodeVerificationCompletion = () => Promise<void>;

export type CodePreparationCommands = {
  requestKey: string;
  canRun: () => boolean;
  shouldAvoidPrepare: boolean;
  shouldAvoidInitialPrepare: boolean;
  prepareRequest: () => Promise<void>;
};

export type CodeVerificationRecovery = {
  resolveCode: boolean;
  complete: CodeVerificationCompletion;
};

export type CodeSubmissionCommands = {
  requestKey: string;
  canRun: () => boolean;
  attempt: (code: string) => Promise<CodeVerificationCompletion>;
  getErrorRecovery?: (error: unknown) => CodeVerificationRecovery | undefined;
};
