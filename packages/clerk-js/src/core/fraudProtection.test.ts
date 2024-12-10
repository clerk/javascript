import { FraudProtection } from './fraudProtection';
import type { Clerk, Client } from './resources/internal';
import { ClerkAPIResponseError } from './resources/internal';

describe('FraudProtectionService', () => {
  let sut: FraudProtection;
  let mockClerk: Clerk;
  let mockClient: typeof Client;
  let solveCaptcha: any;
  let mockManaged: jest.Mock;

  function MockCaptchaChallenge() {
    // @ts-ignore - we don't need to implement the entire class
    this.managed = mockManaged;
  }

  const createCaptchaError = () => {
    return new ClerkAPIResponseError('capcha', {
      data: [{ code: 'requires_captcha' } as any],
      status: 401,
    });
  };

  beforeEach(() => {
    mockManaged = jest.fn().mockResolvedValue(
      new Promise(r => {
        solveCaptcha = r;
      }),
    );

    const mockClientInstance = {
      sendCaptchaToken: jest.fn().mockResolvedValue({}),
    };

    mockClient = {
      getInstance: () => {
        return mockClientInstance;
      },
    } as any as typeof Client;

    mockClerk = { client: mockClient.getInstance() } as any as Clerk;

    sut = new FraudProtection(mockClient, MockCaptchaChallenge as any);
  });

  it('does not handle requests that did not throw', async () => {
    const fn1 = jest.fn().mockResolvedValue('result');

    const fn1res = sut.execute(mockClerk, fn1);

    // both are called in parallel and both will throw
    expect(fn1).toHaveBeenCalledTimes(1);
    await fn1res;

    // only one will need to call the captcha as the other will be blocked
    expect(mockManaged).toHaveBeenCalledTimes(0);
    expect(mockClient.getInstance().sendCaptchaToken).toHaveBeenCalledTimes(0);
    expect(fn1).toHaveBeenCalledTimes(1);
  });

  it('does not handle requests that threw an unrelated error', async () => {
    const unrelatedError = new ClerkAPIResponseError('hello', {
      data: [{ code: 'no-idea' } as any],
      status: 401,
    });
    const fn1 = jest.fn().mockRejectedValueOnce(unrelatedError);
    const fn1res = sut.execute(mockClerk, fn1);
    expect(fn1res).rejects.toEqual(unrelatedError);
    expect(mockManaged).toHaveBeenCalledTimes(0);
    expect(mockClient.getInstance().sendCaptchaToken).toHaveBeenCalledTimes(0);
    expect(fn1).toHaveBeenCalledTimes(1);
  });

  it('handles parallel requests that began at the same time by handling any requests that returned requires_captcha', async () => {
    const fn1 = jest.fn().mockRejectedValueOnce(createCaptchaError()).mockResolvedValueOnce('result1');
    const fn2 = jest.fn().mockResolvedValue('result2');

    const fn1res = sut.execute(mockClerk, fn1);
    const fn2res = sut.execute(mockClerk, fn2);

    // both are called in parallel and both will throw
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);

    solveCaptcha();
    await Promise.all([fn1res, fn2res]);

    // only one will need to call the captcha as the other will be blocked
    expect(mockManaged).toHaveBeenCalledTimes(1);
    expect(mockClient.getInstance().sendCaptchaToken).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledTimes(2);
  });

  it('handles parallel requests that returned 401 requires_captcha', async () => {
    const fn1 = jest.fn().mockRejectedValueOnce(createCaptchaError()).mockResolvedValueOnce('result1');
    const fn2 = jest.fn().mockRejectedValueOnce(createCaptchaError()).mockResolvedValueOnce('result2');

    const fn1res = sut.execute(mockClerk, fn1);
    const fn2res = sut.execute(mockClerk, fn2);

    // both are called in parallel and both will throw
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);

    solveCaptcha();
    await Promise.all([fn1res, fn2res]);

    // captcha will only be called once
    expect(mockManaged).toHaveBeenCalledTimes(1);
    expect(mockClient.getInstance().sendCaptchaToken).toHaveBeenCalledTimes(1);
    // but all failed requests will be retried
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
  });

  it('handles requests that were made in close succession by blocking all other requests if the first returns requires_captcha', async () => {
    const fn1 = jest.fn().mockRejectedValueOnce(createCaptchaError()).mockResolvedValueOnce('result1');
    const fn2 = jest.fn().mockResolvedValue('result2');

    // Start the first request
    const fn1res = sut.execute(mockClerk, fn1);
    // And then start the 2nd request in parallel after a few MS
    // so we can test that the 2nd request is blocked AFTER fn1 has thrown
    await new Promise(r => setTimeout(r, 100));
    const fn2res = sut.execute(mockClerk, fn2);

    // fn1 will be called and we will try to handle the captcha
    expect(fn1).toHaveBeenCalledTimes(1);
    // fn2 and all other calls will be blocked until the captcha is solved
    // and the client is updated
    expect(fn2).toHaveBeenCalledTimes(0);

    solveCaptcha();
    await Promise.all([fn1res, fn2res]);

    expect(mockManaged).toHaveBeenCalledTimes(1);
    expect(mockClient.getInstance().sendCaptchaToken).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('execute blocked requests if the first request failed even after successfully solving the captcha challenge', async () => {
    const unrelatedError = new ClerkAPIResponseError('hello', {
      data: [{ code: 'no-idea' } as any],
      status: 401,
    });

    // both with fail in parallel but fn2 will temporarily be blocked from retrying
    const fn1 = jest.fn().mockRejectedValueOnce(createCaptchaError()).mockRejectedValueOnce(unrelatedError);
    const fn2 = jest.fn().mockRejectedValueOnce(createCaptchaError()).mockResolvedValue('result2');
    // fn3 will be blocked until the captcha is solved
    const fn3 = jest.fn().mockResolvedValue('result3');

    const fn1res = sut.execute(mockClerk, fn1);
    const fn2res = sut.execute(mockClerk, fn2);
    await new Promise(r => setTimeout(r, 100));
    const fn3res = sut.execute(mockClerk, fn3);

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn3).toHaveBeenCalledTimes(0);

    solveCaptcha();
    // fn1 rejects
    expect(fn1res).rejects.toEqual(unrelatedError);
    // but the other requests will be unblocked and retried
    await Promise.all([fn2res, fn3res]);

    expect(mockManaged).toHaveBeenCalledTimes(1);
    expect(mockClient.getInstance().sendCaptchaToken).toHaveBeenCalledTimes(1);

    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
    expect(fn3).toHaveBeenCalledTimes(1);
  });
});
