const STILL_FINISHING = /iOS (?:automation )?runner is still finishing a (?:previous )?command/;

export const isRunnerBusy = (error: unknown): boolean => error instanceof Error && STILL_FINISHING.test(error.message);

export interface BusyWait {
  waited(): Promise<boolean>;
}

export function busyWaits(most: number, wait: () => Promise<unknown>): BusyWait {
  let left = most;
  return {
    async waited() {
      if (left <= 0) return false;
      left -= 1;
      await wait();
      return true;
    },
  };
}

export const NO_BUSY_WAIT: BusyWait = busyWaits(0, async () => undefined);

export async function onceTheRunnerIsFree<T>(step: () => Promise<T>, busy: BusyWait): Promise<T> {
  let refusal: unknown;
  for (;;) {
    try {
      return await step();
    } catch (error) {
      if (!isRunnerBusy(error)) throw error;
      refusal ??= error;
      if (!(await busy.waited())) throw refusal;
    }
  }
}
