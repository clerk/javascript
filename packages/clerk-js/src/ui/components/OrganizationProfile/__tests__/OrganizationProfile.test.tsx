import { describe, it } from '@jest/globals';
import React from 'react';

import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { OrganizationProfile } from '../OrganizationProfile';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationProfile', () => {
  it('includes buttons for the bigger sections', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: ['Org1'] });
    });

    const { getByText } = render(<OrganizationProfile />, { wrapper });
    expect(getByText('Org1')).toBeDefined();
    expect(getByText('Members')).toBeDefined();
    expect(getByText('Settings')).toBeDefined();
  });
});
