export const COVERED = 'covered by another visible element';

export interface TapSettle {
  readonly timeoutMs: number;
  now(): number;
  wait(): Promise<unknown>;
}

export async function tapOnceUncovered(tap: () => Promise<void>, settle: TapSettle): Promise<void> {
  const deadline = settle.now() + settle.timeoutMs;
  for (;;) {
    try {
      return await tap();
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes(COVERED) || settle.now() >= deadline) throw error;
      await settle.wait();
    }
  }
}
