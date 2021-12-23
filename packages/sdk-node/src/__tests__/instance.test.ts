const TEST_API_KEY = 'TEST_API_KEY';

describe('Custom Clerk instance initialization', () => {
  test('throw error when initialized without apiKey', () => {
    /** In this case we are resetting jest module cache */
    jest.resetModules();
    process.env = {};
    const Clerk = require('../instance').default;
    expect(() => new Clerk()).toThrow(Error);
  });

  test('with custom apiKey', () => {
    jest.resetModules();
    process.env = {};
    const Clerk = require('../instance').default;
    expect(() => new Clerk({ apiKey: TEST_API_KEY })).not.toThrow(Error);
  });

  test('fallback to process.env for apiKey', () => {
    jest.resetModules();
    process.env.CLERK_API_KEY = TEST_API_KEY;
    const Clerk = require('../instance').default;
    expect(() => new Clerk()).not.toThrow(Error);
  });
});
