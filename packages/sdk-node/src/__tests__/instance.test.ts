const TEST_API_KEY = 'TEST_API_KEY';
const TEST_JWT_KEY = 'TEST_JWT_KEY';

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

  test('custom keys overrides process env and default params', () => {
    jest.resetModules();
    process.env.CLERK_API_KEY = TEST_API_KEY;
    process.env.CLERK_JWT_KEY = TEST_JWT_KEY;
    const Clerk = require('../instance').default;
    expect(() => {
      const customAPIKey = 'custom_api_key';
      const customJWTKey = 'custom_jwt_key';
      const customAPIVersion = 'v0';
      const customAPIUrl = 'https://customdomain.com';
      const instance = new Clerk({
        apiKey: customAPIKey,
        jwtKey: customJWTKey,
        serverApiUrl: customAPIUrl,
        apiVersion: customAPIVersion,
      });
      expect(instance._restClient.apiKey).toBe(customAPIKey);
      expect(instance.jwtKey).toBe(customJWTKey);
      expect(instance._restClient.serverApiUrl).toBe(customAPIUrl);
      expect(instance._restClient.apiVersion).toBe(customAPIVersion);
    }).not.toThrow(Error);
  });
});
