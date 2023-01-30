import { jest } from '@jest/globals';
import { act } from '@testing-library/react';

type WithAct = <T>(fn: T) => T;
const withAct = ((fn: any) =>
  (...args: any) => {
    act(() => {
      fn(...args);
    });
  }) as WithAct;

const advanceTimersByTime = withAct(jest.advanceTimersByTime.bind(jest));
const runAllTimers = withAct(jest.runAllTimers.bind(jest));
const runOnlyPendingTimers = withAct(jest.runOnlyPendingTimers.bind(jest));

const createFakeTimersHelpers = () => {
  return { advanceTimersByTime, runAllTimers, runOnlyPendingTimers };
};

type FakeTimersHelpers = ReturnType<typeof createFakeTimersHelpers>;
type RunFakeTimersCallback = (timers: FakeTimersHelpers) => void | Promise<void>;

export const runFakeTimers = <T extends RunFakeTimersCallback, R extends ReturnType<T>>(
  cb: T,
): R extends Promise<any> ? Promise<void> : void => {
  jest.useFakeTimers();
  const res = cb(createFakeTimersHelpers());
  if (res && 'then' in res) {
    // @ts-expect-error
    return res.finally(() => jest.useRealTimers());
  }
  jest.useRealTimers();
  // @ts-ignore
  return;
};
