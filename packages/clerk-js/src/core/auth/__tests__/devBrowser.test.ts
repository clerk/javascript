import type { FapiClient } from '../../fapiClient';
import { createDevBrowser } from '../devBrowser';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

describe('Thrown errors', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve<RecursivePartial<Response>>({
        ok: false,
        json: () =>
          Promise.resolve({
            errors: [
              {
                message: 'URL-based session syncing is disabled for this instance',
                long_message:
                  'This is a development instance operating with legacy, third-party cookies. To enable URL-based session syncing refer to https://clerk.com/docs/upgrade-guides/url-based-session-syncing.',
                code: 'url_based_session_syncing_disabled',
              },
            ],
            clerk_trace_id: 'ff1048d1cb5a74da3ebd660877680ba3',
          }),
      }),
    );
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch?.mockClear();
  });

  // Note: The test runs without any initial or mocked values on __clerk_db_jwt cookies.
  // It is expected to modify the test accordingly if cookies are mocked for future extra testing.
  it('throws any FAPI errors during dev browser creation', async () => {
    const mockCreateFapiClient = jest.fn().mockImplementation(() => {
      return {
        buildUrl: jest.fn(() => 'https://white-koala-42.clerk.accounts.dev/dev_browser'),
        onAfterResponse: jest.fn(),
        onBeforeRequest: jest.fn(),
      };
    });

    const mockFapiClient = mockCreateFapiClient() as FapiClient;

    const devBrowserHandler = createDevBrowser({
      frontendApi: 'white-koala-42.clerk.accounts.dev',
      fapiClient: mockFapiClient,
      publishableKey: 'pk_test_d2hpdGUta29hbGEtNDIuY2xlcmsuYWNjb3VudHMuZGV2JA',
    });

    await expect(devBrowserHandler.setup()).rejects.toThrow(
      'ClerkJS: Something went wrong initializing Clerk in development mode. This is a development instance operating with legacy, third-party cookies. To enable URL-based session syncing refer to https://clerk.com/docs/upgrade-guides/url-based-session-syncing.',
    );
  });
});
