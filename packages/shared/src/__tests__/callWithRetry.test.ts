import { callWithRetry } from '../callWithRetry';

describe('callWithRetry', () => {
  test('should return the result of the function if it succeeds', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const result = await callWithRetry(fn);
    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should retry the function if it fails', async () => {
    const fn = jest.fn().mockRejectedValueOnce(new Error('error')).mockResolvedValueOnce('result');
    const result = await callWithRetry(fn, 1, 2);
    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('should throw an error if the function fails too many times', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('error'));
    await expect(callWithRetry(fn, 1, 2)).rejects.toThrow('error');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
