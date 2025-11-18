import type { SignInFirstFactor } from '@clerk/shared/types';

import { SignInSafeIdentifierSelectorForStrategy } from '../router.selectors';
import type { SignInRouterSnapshot } from '../router.types';

const IDENTIFIER = 'support@clerk.dev';

function createSnapshot(
  supportedFirstFactors: Partial<SignInFirstFactor>[] = [],
  identifier?: string,
): SignInRouterSnapshot {
  return {
    context: {
      clerk: {
        client: {
          signIn: {
            status: 'needs_first_factor',
            supportedFirstFactors: supportedFirstFactors.map(f => ({
              strategy: 'email_code',
              emailAddressId: 'idn_foo',
              ...f,
            })),
            supportedSecondFactors: null,
            identifier: identifier,
          },
        },
      },
    },
  } as unknown as SignInRouterSnapshot;
}

describe('SignInSafeIdentifierSelectorForStrategy', () => {
  describe('Match: Identifier', () => {
    it('should output support@clerk.dev (matchingFactorForIdentifier.safeIdentifier)', () => {
      const snapshot = createSnapshot(
        [
          {
            safeIdentifier: 's******@c****.com',
          },
          {
            safeIdentifier: IDENTIFIER,
            primary: true,
          },
        ],
        IDENTIFIER,
      );

      const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot);
      expect(result).toEqual(IDENTIFIER);
    });
  });

  describe('Match: Strategy', () => {
    it('should output support@clerk.dev (matchingFactorForStrategy.safeIdentifier)', () => {
      const snapshot = createSnapshot(
        [
          {
            safeIdentifier: 's******@c****.com',
          },
          {
            safeIdentifier: IDENTIFIER,
            primary: true,
          },
        ],
        IDENTIFIER,
      );

      const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot);
      expect(result).toEqual(IDENTIFIER);
    });

    it('should output s*****1@c****.com (matchingFactorForStrategy.safeIdentifier)', () => {
      const snapshot = createSnapshot(
        [
          {
            safeIdentifier: 's*****1@c****.com',
          },
          {
            safeIdentifier: 's*****2@c****.com',
            primary: true,
          },
        ],
        IDENTIFIER,
      );

      const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot);
      expect(result).toEqual('s*****1@c****.com');
    });
  });

  describe('Match: Default', () => {
    it('should output support@clerk.dev (signIn.identifier)', () => {
      const snapshot = createSnapshot([], IDENTIFIER);
      const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot);
      expect(result).toEqual(IDENTIFIER);
    });

    it('should output an empty string', () => {
      const snapshot = createSnapshot([], undefined);
      const result = SignInSafeIdentifierSelectorForStrategy('email_code')(snapshot);
      expect(result).toEqual('');
    });
  });
});
