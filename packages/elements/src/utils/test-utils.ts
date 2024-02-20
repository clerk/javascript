import { renderHook } from '@testing-library/react';

// This suppresses console.error from cluttering the test output.
const mockConsoleError = () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
};

const restoreConsoleError = () => {
  if ((console.error as unknown as jest.SpyInstance).mockRestore !== undefined) {
    (console.error as unknown as jest.SpyInstance).mockRestore();
  }
};

export const catchHookError = (...args: any[]): Error => {
  let error;
  mockConsoleError();

  try {
    // @ts-expect-error - For test purposes
    renderHook(...args);
  } catch (e) {
    error = e;
  }

  restoreConsoleError();
  return error as Error;
};
