import { jest } from '@jest/globals';

import { callWithRetry } from '../callWithRetry.js';

describe('callWithRetry', () => {
  test('should return the result of the function if it succeeds', async () => {
    const fn = jest.fn().mockResolvedValue('result' as never);
    const result = await callWithRetry(fn as any);
    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should retry the function if it fails', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('error') as never)
      .mockResolvedValueOnce('result' as never);
    const result = await callWithRetry(fn as any, 1, 2);
    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('should throw an error if the function fails too many times', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('error') as never);
    await expect(callWithRetry(fn as any, 1, 2)).rejects.toThrow('error');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
