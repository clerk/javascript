import { vi } from 'vitest';
// import { jest } from '@jest/globals';
import { act } from '@testing-library/react';

type WithAct = <T>(fn: T) => T;
const withAct = ((fn: any) =>
  (...args: any) => {
    act(() => {
      fn(...args);
    });
  }) as WithAct;

const advanceTimersByTime = withAct(vi.advanceTimersByTime.bind(vi));
const runAllTimers = withAct(vi.runAllTimers.bind(vi));
const runOnlyPendingTimers = withAct(vi.runOnlyPendingTimers.bind(vi));

const createFakeTimersHelpers = () => {
  return { advanceTimersByTime, runAllTimers, runOnlyPendingTimers };
};

type FakeTimersHelpers = ReturnType<typeof createFakeTimersHelpers>;
type RunFakeTimersCallback = (timers: FakeTimersHelpers) => void | Promise<void>;

export const runFakeTimers = <T extends RunFakeTimersCallback, R extends ReturnType<T>>(
  cb: T,
): R extends Promise<any> ? Promise<void> : void => {
  vi.useFakeTimers();
  const res = cb(createFakeTimersHelpers());
  if (res && 'then' in res) {
    // @ts-expect-error
    return res.finally(() => vi.useRealTimers());
  }
  vi.useRealTimers();
  // @ts-ignore
  return;
};
