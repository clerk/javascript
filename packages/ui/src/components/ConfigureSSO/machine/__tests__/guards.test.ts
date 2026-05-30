import { describe, expect, it } from 'vitest';

import type { WizardFacts } from '../../data/deriveFacts';
import { configureFulfilled, testFulfilled, verifyDomainFulfilled } from '../guards';

const baseFacts: WizardFacts = {
  hasConnection: false,
  isPrimaryEmailVerified: false,
  isDomainTakenByOtherOrg: false,
  hasMinimumIdPConfig: false,
  hasSuccessfulTestRun: false,
  isConnectionActive: false,
  provider: undefined,
};

const facts = (overrides: Partial<WizardFacts>): WizardFacts => ({ ...baseFacts, ...overrides });

describe('guards', () => {
  describe('verifyDomainFulfilled', () => {
    const cases: Array<{ name: string; input: Partial<WizardFacts>; expected: boolean }> = [
      { name: 'verified, not taken → true', input: { isPrimaryEmailVerified: true }, expected: true },
      { name: 'not verified → false', input: { isPrimaryEmailVerified: false }, expected: false },
      {
        name: 'verified but domain taken by other org → false',
        input: { isPrimaryEmailVerified: true, isDomainTakenByOtherOrg: true },
        expected: false,
      },
      {
        name: 'not verified and domain taken → false',
        input: { isPrimaryEmailVerified: false, isDomainTakenByOtherOrg: true },
        expected: false,
      },
    ];

    it.each(cases)('$name', ({ input, expected }) => {
      expect(verifyDomainFulfilled(facts(input))).toBe(expected);
    });
  });

  describe('configureFulfilled', () => {
    const cases: Array<{ name: string; input: Partial<WizardFacts>; expected: boolean }> = [
      { name: 'has minimum IdP config → true', input: { hasMinimumIdPConfig: true }, expected: true },
      { name: 'no minimum IdP config → false', input: { hasMinimumIdPConfig: false }, expected: false },
    ];

    it.each(cases)('$name', ({ input, expected }) => {
      expect(configureFulfilled(facts(input))).toBe(expected);
    });
  });

  describe('testFulfilled', () => {
    const cases: Array<{ name: string; input: Partial<WizardFacts>; expected: boolean }> = [
      { name: 'has successful test run → true', input: { hasSuccessfulTestRun: true }, expected: true },
      { name: 'no successful test run → false', input: { hasSuccessfulTestRun: false }, expected: false },
    ];

    it.each(cases)('$name', ({ input, expected }) => {
      expect(testFulfilled(facts(input))).toBe(expected);
    });
  });
});
