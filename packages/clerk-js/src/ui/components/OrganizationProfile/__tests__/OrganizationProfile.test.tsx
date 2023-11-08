import type { CustomPage } from '@clerk/types';
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
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1'] });
    });

    const { getByText } = render(<OrganizationProfile />, { wrapper });
    expect(getByText('Org1')).toBeDefined();
    expect(getByText('Members')).toBeDefined();
    expect(getByText('Settings')).toBeDefined();
  });

  it('includes custom nav items', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: ['Org1'] });
    });

    const customPages: CustomPage[] = [
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      {
        label: 'ExternalLink',
        url: '/link',
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];

    props.setProps({ customPages });

    const { getByText } = render(<OrganizationProfile />, { wrapper });
    expect(getByText('Org1')).toBeDefined();
    expect(getByText('Members')).toBeDefined();
    expect(getByText('Settings')).toBeDefined();
    expect(getByText('Custom1')).toBeDefined();
    expect(getByText('ExternalLink')).toBeDefined();
  });
});
