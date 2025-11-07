import { describe, expect, test, vi } from 'vitest';

import * as retryModule from '../../retry';
import { safeImport } from '../index';

describe('safeImport', () => {
  test('calls retry with correct configuration', async () => {
    const retrySpy = vi.spyOn(retryModule, 'retry');
    const testModule = './test-module';

    try {
      await safeImport(testModule);
    } catch {
      // Ignore import errors since we're just testing the retry configuration
    }

    expect(retrySpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        initialDelay: 100,
        retryImmediately: true,
        factor: 2,
      }),
    );

    retrySpy.mockRestore();
  });

  test('returns imported module on success', async () => {
    const mockModule = { default: 'test-module', namedExport: 'value' };

    // Mock the retry to immediately return our mock module
    const retrySpy = vi.spyOn(retryModule, 'retry').mockResolvedValueOnce(mockModule);

    const result = await safeImport('./test-module');

    expect(result).toBe(mockModule);
    expect(retrySpy).toHaveBeenCalledTimes(1);

    retrySpy.mockRestore();
  });

  test('propagates import errors after retries', async () => {
    const importError = new Error('Module not found');

    // Mock retry to reject with our error
    const retrySpy = vi.spyOn(retryModule, 'retry').mockRejectedValueOnce(importError);

    await expect(safeImport('./non-existent-module')).rejects.toThrow('Module not found');

    retrySpy.mockRestore();
  });

  test('configures shouldRetry to allow up to 3 retries', async () => {
    const retrySpy = vi.spyOn(retryModule, 'retry');

    try {
      await safeImport('./test-module');
    } catch {
      // Ignore errors
    }

    const options = retrySpy.mock.calls[0][1];
    const shouldRetry = options?.shouldRetry;

    expect(shouldRetry).toBeDefined();
    if (shouldRetry) {
      // Test the shouldRetry logic
      expect(shouldRetry(new Error('test'), 1)).toBe(true); // First retry
      expect(shouldRetry(new Error('test'), 2)).toBe(true); // Second retry
      expect(shouldRetry(new Error('test'), 3)).toBe(true); // Third retry
      expect(shouldRetry(new Error('test'), 4)).toBe(false); // Fourth attempt should not retry
    }

    retrySpy.mockRestore();
  });
});
