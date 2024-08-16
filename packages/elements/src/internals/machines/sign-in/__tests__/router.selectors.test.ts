import type { PartialDeep } from 'type-fest';

import { SignInSafeIdentifierSelectorForStrategy } from '../router.selectors';
import type { SignInRouterSnapshot } from '../router.types';

describe('SignInSafeIdentifierSelectorForStrategy', () => {
  it('should output support@clerk.dev (firstFactor - safeIdentifier)', () => {
    const identifier = 'support@clerk.dev';
    const snapshot: PartialDeep<SignInRouterSnapshot> = {
      status: 'active',
      context: {
        clerk: {
          client: {
            signIn: {
              status: 'needs_first_factor',
              supportedFirstFactors: [
                {
                  strategy: 'email_code',
                  safeIdentifier: 's******@c****.com',
                  emailAddressId: 'idn_foo',
                },
                {
                  strategy: 'email_code',
                  safeIdentifier: identifier,
                  emailAddressId: 'idn_bar',
                  primary: true,
                },
              ],
              supportedSecondFactors: null,
              identifier,
            },
          },
        },
      },
    };

    const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot as any);
    expect(result).toEqual(identifier);
  });

  it('should output support@clerk.dev (identifier)', () => {
    const identifier = 'support@clerk.dev';
    const snapshot: PartialDeep<SignInRouterSnapshot> = {
      status: 'active',
      context: {
        clerk: {
          client: {
            signIn: {
              status: 'needs_first_factor',
              supportedFirstFactors: [
                {
                  strategy: 'email_code',
                  safeIdentifier: 's******@c****.com',
                  emailAddressId: 'idn_foo',
                },
                {
                  strategy: 'email_code',
                  safeIdentifier: 's******@c****.com',
                  emailAddressId: 'idn_bar',
                  primary: true,
                },
              ],
              supportedSecondFactors: null,
              identifier,
            },
          },
        },
      },
    };

    const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot as any);
    expect(result).toEqual(identifier);
  });

  it('should output support@clerk.dev (identfier - default)', () => {
    const identifier = 'support@clerk.dev';
    const snapshot: PartialDeep<SignInRouterSnapshot> = {
      status: 'active',
      context: {
        clerk: {
          client: {
            signIn: {
              status: 'needs_first_factor',
              supportedFirstFactors: [],
              supportedSecondFactors: null,
              identifier,
            },
          },
        },
      },
    };

    const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot as any);
    expect(result).toEqual(identifier);
  });

  it('should output s******@c****.com (initial factor)', () => {
    const snapshot: PartialDeep<SignInRouterSnapshot> = {
      status: 'active',
      context: {
        clerk: {
          client: {
            signIn: {
              status: 'needs_first_factor',
              supportedFirstFactors: [
                {
                  strategy: 'email_code',
                  safeIdentifier: 's******@c****.com',
                  emailAddressId: 'idn_foo',
                },
                {
                  strategy: 'email_code',
                  safeIdentifier: 's*****2@c****.com',
                  emailAddressId: 'idn_bar',
                  primary: true,
                },
              ],
              supportedSecondFactors: null,
              identifier: undefined,
            },
          },
        },
      },
    };

    const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot as any);
    expect(result).toEqual('s******@c****.com');
  });

  it('should output an empty string', () => {
    const snapshot: PartialDeep<SignInRouterSnapshot> = {
      status: 'active',
      context: {
        clerk: {
          client: {
            signIn: {
              status: 'needs_first_factor',
              supportedFirstFactors: [],
              supportedSecondFactors: null,
              identifier: undefined,
            },
          },
        },
      },
    };

    const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot as any);
    expect(result).toEqual('');
  });
});
