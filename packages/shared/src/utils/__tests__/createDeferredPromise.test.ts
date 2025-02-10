import { createDeferredPromise } from '../createDeferredPromise';

describe('createDeferredPromise', () => {
  test('resolves with correct value', async () => {
    const { promise, resolve } = createDeferredPromise();
    const expectedValue = 'hello world';
    resolve(expectedValue);
    const result = await promise;
    expect(result).toBe(expectedValue);
  });

  test('rejects with correct error', async () => {
    const { promise, reject } = createDeferredPromise();
    const expectedError = new Error('something went wrong');
    reject(expectedError);
    try {
      await promise;
    } catch (error) {
      expect(error).toBe(expectedError);
    }
  });
});
