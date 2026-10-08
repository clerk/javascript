import { describe, expect, it } from 'vitest';

import { allowsIdentificationCreation } from '../allows-identification-creation';

describe('allowsIdentificationCreation', () => {
  const enterpriseSSO = { enabled: true };

  it('blocks creation for an active enterprise connection that disables additional identifications', () => {
    const blocked = {
      enterpriseAccounts: [{ active: true, enterpriseConnection: { disableAdditionalIdentifications: true } }],
    };
    expect(allowsIdentificationCreation(blocked, enterpriseSSO)).toBe(false);
  });

  it('allows creation when the enterprise connection is inactive or enterprise SSO is off', () => {
    const inactive = {
      enterpriseAccounts: [{ active: false, enterpriseConnection: { disableAdditionalIdentifications: true } }],
    };
    expect(allowsIdentificationCreation(inactive, enterpriseSSO)).toBe(true);

    const active = {
      enterpriseAccounts: [{ active: true, enterpriseConnection: { disableAdditionalIdentifications: true } }],
    };
    expect(allowsIdentificationCreation(active, { enabled: false })).toBe(true);
  });
});
