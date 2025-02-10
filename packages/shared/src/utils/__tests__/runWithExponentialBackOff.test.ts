import { runWithExponentialBackOff } from '../runWithExponentialBackOff';

describe('runWithExponentialBackOff', () => {
  test('resolves with the result of the callback', async () => {
    const result = await runWithExponentialBackOff(() => Promise.resolve('success'));
    expect(result).toBe('success');
  });

  test('retries the callback until it succeeds', async () => {
    let attempts = 0;
    const result = await runWithExponentialBackOff(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('failed');
      }
      return Promise.resolve('success');
    });
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
});
