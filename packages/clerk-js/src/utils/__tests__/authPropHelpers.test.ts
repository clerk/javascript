import { pickRedirectionProp } from '../authPropHelpers';

describe('pickRedirectionProp', () => {
  it('returns undefined if no values exist', () => {
    expect(
      pickRedirectionProp('afterSignInUrl', {
        queryParams: {},
        ctx: {},
        options: {},
        displayConfig: {} as any,
      }),
    ).toEqual(undefined);
  });

  it('returns empty string if the value has a banned protocol', () => {
    expect(
      pickRedirectionProp('afterSignInUrl', {
        queryParams: {
          after_sign_in_url: 'javascript:alert("hi")',
        },
        ctx: {},
        options: {},
        displayConfig: {} as any,
      }),
    ).toEqual('');
  });

  it('converts the key to snake case to match the query param', () => {
    expect(
      pickRedirectionProp('thisIsAKeyValue' as any, {
        queryParams: {
          this_is_a_key_value: '/value',
        },
        ctx: {},
        options: {},
        displayConfig: {} as any,
      }),
    ).toEqual('/value');
  });

  describe('Priorities', () => {
    it('returns the query param value if all the values exist', () => {
      expect(
        pickRedirectionProp('afterSignInUrl', {
          queryParams: {
            after_sign_in_url: '/query_after_sign_in_url',
            redirect_url: '/query_redirect_url',
          },
          ctx: {
            afterSignInUrl: '/ctx_afterSignInUrl',
            redirectUrl: '/ctx_redirectUrl',
          },
          options: { afterSignInUrl: '/options_afterSignInUrl' },
          displayConfig: { afterSignInUrl: '/displayConfig_afterSignInUrl' } as any,
        }),
      ).toEqual('/query_after_sign_in_url');
    });

    it('fallbacks to redirect_url query param value if exact value does not exist', () => {
      expect(
        pickRedirectionProp('afterSignInUrl', {
          queryParams: {
            redirect_url: '/query_redirect_url',
          },
          ctx: {
            afterSignInUrl: '/ctx_afterSignInUrl',
            redirectUrl: '/ctx_redirectUrl',
          },
          options: { afterSignInUrl: '/options_afterSignInUrl' },
          displayConfig: { afterSignInUrl: '/displayConfig_afterSignInUrl' } as any,
        }),
      ).toEqual('/query_redirect_url');
    });

    it('bypasses redirect_url query param value if accessRedirectUrl is false', () => {
      expect(
        pickRedirectionProp(
          'afterSignInUrl',
          {
            queryParams: {
              redirect_url: '/query_redirect_url',
            },
            ctx: {
              afterSignInUrl: '/ctx_afterSignInUrl',
              redirectUrl: '/ctx_redirectUrl',
            },
            options: { afterSignInUrl: '/options_afterSignInUrl' },
            displayConfig: { afterSignInUrl: '/displayConfig_afterSignInUrl' } as any,
          },
          false,
        ),
      ).toEqual('/ctx_afterSignInUrl');
    });

    it('returns the ctx value if queryParams is missing', () => {
      expect(
        pickRedirectionProp('afterSignInUrl', {
          ctx: {
            afterSignInUrl: '/ctx_afterSignInUrl',
            redirectUrl: '/ctx_redirectUrl',
          },
          options: { afterSignInUrl: '/options_afterSignInUrl' },
          displayConfig: { afterSignInUrl: '/displayConfig_afterSignInUrl' } as any,
        }),
      ).toEqual('/ctx_afterSignInUrl');
    });

    it('fallbacks to redirect_url ctx value if queryParams and exact ctx value does not exist', () => {
      expect(
        pickRedirectionProp('afterSignInUrl', {
          ctx: {
            redirectUrl: '/ctx_redirectUrl',
          },
          options: { afterSignInUrl: '/options_afterSignInUrl' },
          displayConfig: { afterSignInUrl: '/displayConfig_afterSignInUrl' } as any,
        }),
      ).toEqual('/ctx_redirectUrl');
    });

    it('returns the options value if queryParams and ctx are missing', () => {
      expect(
        pickRedirectionProp('afterSignInUrl', {
          options: { afterSignInUrl: '/options_afterSignInUrl' },
          displayConfig: { afterSignInUrl: '/displayConfig_afterSignInUrl' } as any,
        }),
      ).toEqual('/options_afterSignInUrl');
    });

    it('returns the displayConfig value if queryParams, ctx and options are missing', () => {
      expect(
        pickRedirectionProp('afterSignInUrl', {
          displayConfig: { afterSignInUrl: '/displayConfig_afterSignInUrl' } as any,
        }),
      ).toEqual('/displayConfig_afterSignInUrl');
    });
  });
});
