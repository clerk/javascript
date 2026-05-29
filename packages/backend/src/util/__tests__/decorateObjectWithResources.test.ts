import { describe, expect, it } from 'vitest';

import { Organization } from '../../api/resources/Organization';
import { User } from '../../api/resources/User';
import { stripPrivateDataFromObject } from '../decorateObjectWithResources';

describe('stripPrivateDataFromObject', () => {
  it('removes top-level private metadata from user and organization', () => {
    const result = stripPrivateDataFromObject({
      user: { id: 'user_1', privateMetadata: { secret: 'a' } } as any,
      organization: { id: 'org_1', privateMetadata: { secret: 'b' } } as any,
    });

    expect(result.user).not.toHaveProperty('privateMetadata');
    expect(result.organization).not.toHaveProperty('privateMetadata');
  });

  it('strips private_metadata nested under the backend resource `_raw` payload', () => {
    const user = User.fromJSON({
      id: 'user_1',
      object: 'user',
      private_metadata: { ssn: '000-00-0000' },
      public_metadata: { plan: 'pro' },
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
      enterprise_accounts: [],
    } as any);

    const organization = Organization.fromJSON({
      id: 'org_1',
      object: 'organization',
      name: 'Acme',
      slug: 'acme',
      private_metadata: { billingCustomerId: 'cus_secret' },
      public_metadata: { tier: 'enterprise' },
    } as any);

    const result = stripPrivateDataFromObject({ user, organization });

    // Serialize the way `buildClerkProps` embeds the state into the HTML response.
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('000-00-0000');
    expect(serialized).not.toContain('cus_secret');

    expect((result.user as any)._raw).not.toHaveProperty('private_metadata');
    expect((result.organization as any)._raw).not.toHaveProperty('private_metadata');

    // Public metadata under `_raw` is intentionally preserved.
    expect((result.user as any)._raw.public_metadata).toEqual({ plan: 'pro' });
    expect((result.organization as any)._raw.public_metadata).toEqual({ tier: 'enterprise' });
  });

  it('does not mutate the original resource `raw` payload', () => {
    const user = User.fromJSON({
      id: 'user_1',
      object: 'user',
      private_metadata: { ssn: '000-00-0000' },
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
      enterprise_accounts: [],
    } as any);

    stripPrivateDataFromObject({ user });

    // The server-side `raw` getter must still expose the full payload.
    expect(user.raw?.private_metadata).toEqual({ ssn: '000-00-0000' });
  });
});
