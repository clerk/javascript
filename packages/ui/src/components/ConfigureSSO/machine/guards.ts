import type { WizardFacts } from '../data/deriveFacts';

/**
 * Pure, named step guards over {@link WizardFacts}.
 *
 * Each guard answers "is this step already satisfied?" so the reducer can skip
 * it when walking forward. They are pure functions of facts — no React, no side
 * effects — and are the single place the wizard's "fulfilled" semantics live.
 */

/**
 * The verify-domain step is fulfilled once the user's primary email is verified
 * and the domain isn't already claimed by another org. A domain-taken-by-other-org
 * state is a terminal warning, never a fulfilled pass-through.
 */
export const verifyDomainFulfilled = (f: WizardFacts): boolean =>
  f.isPrimaryEmailVerified && !f.isDomainTakenByOtherOrg;

/**
 * The configure step is fulfilled once the connection carries the minimum IdP
 * configuration (currently SAML IdP SSO URL + entity ID).
 */
export const configureFulfilled = (f: WizardFacts): boolean => f.hasMinimumIdPConfig;

/**
 * The test step is fulfilled once the connection has at least one successful
 * test run.
 */
export const testFulfilled = (f: WizardFacts): boolean => f.hasSuccessfulTestRun;
