export type NativePasskeyStage =
  | 'preparingFirstFactor'
  | 'preparingSecondFactor'
  | 'requestingAuthorization'
  | 'attemptingFirstFactor'
  | 'attemptingSecondFactor';

export type NativePasskeyOptions = {
  allowSecondFactor?: boolean;
  onStage?: (stage: NativePasskeyStage) => void;
  preferImmediatelyAvailableCredentials?: boolean;
};

export type NativePasskeyPrepareParams = { strategy: 'passkey' };
export type NativePasskeyAttemptParams = { strategy: 'passkey'; publicKeyCredential: string };
