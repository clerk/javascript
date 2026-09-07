export type NativeIdentityContext = {
  ensureActive(): void;
  identityEpoch(): number;
  credential(): string;
  commitState(): Promise<void>;
  beginTokenTransaction(): string;
  commitTokenTransaction(id: string, update: () => void): Promise<void>;
  discardTokenTransaction(id: string): void;
};
