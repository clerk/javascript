import { NO_BUSY_WAIT, onceTheRunnerIsFree, type BusyWait } from './busy-runner.ts';

export const COVERED = 'covered by another visible element';

export interface TapSettle {
  readonly timeoutMs: number;
  now(): number;
  wait(): Promise<unknown>;
}

export async function tapOnceUncovered(tap: () => Promise<void>, settle: TapSettle, busy: BusyWait = NO_BUSY_WAIT): Promise<void> {
  const deadline = settle.now() + settle.timeoutMs;
  for (;;) {
    try {
      return await onceTheRunnerIsFree(tap, busy);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes(COVERED) || settle.now() >= deadline) throw error;
      await settle.wait();
    }
  }
}
