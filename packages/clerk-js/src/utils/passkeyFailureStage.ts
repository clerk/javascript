export type PasskeyFailureStage =
  | 'preparingFirstFactor'
  | 'preparingSecondFactor'
  | 'requestingAuthorization'
  | 'attemptingFirstFactor'
  | 'attemptingSecondFactor';

const stages = new WeakMap<object, PasskeyFailureStage>();

export function recordPasskeyFailureStage(error: unknown, stage: PasskeyFailureStage): void {
  if (error && typeof error === 'object') stages.set(error, stage);
}

export function getPasskeyFailureStage(error: unknown): PasskeyFailureStage | undefined {
  return error && typeof error === 'object' ? stages.get(error) : undefined;
}
