// import { jest } from '@jest/globals';
import { act } from '@testing-library/react';
import { vi } from 'vitest';

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

export async function runFakeTimers(cb: (timers: FakeTimersHelpers) => void): Promise<void>;
export async function runFakeTimers(cb: (timers: FakeTimersHelpers) => Promise<void>): Promise<void>;
export async function runFakeTimers(cb: RunFakeTimersCallback): Promise<void> {
  vi.useFakeTimers();
  try {
    const result = cb(createFakeTimersHelpers());
    if (result instanceof Promise) {
      await result;
    }
  } finally {
    vi.useRealTimers();
  }
}
