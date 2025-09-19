import type { CustomPage } from '@clerk/types';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render } from '../../../../vitestUtils';
import { bindCreateFixtures } from '../../../utils/vitest/createFixtures';
import { OrganizationProfile } from '../';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationProfile', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('includes buttons for the bigger sections', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1'] });
    });

    const { getByText } = render(<OrganizationProfile />, { wrapper });
    expect(getByText('General')).toBeDefined();
    expect(getByText('Members')).toBeDefined();
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
    expect(getByText('Members')).toBeDefined();
    expect(getByText('General')).toBeDefined();
    expect(getByText('Custom1')).toBeDefined();
    expect(getByText('ExternalLink')).toBeDefined();
  });

  it('removes member nav item if user is lacking permissions', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [
          {
            name: 'Org1',
            permissions: [],
          },
        ],
      });
    });

    const { queryByText } = render(<OrganizationProfile />, { wrapper });
    expect(queryByText('Members')).not.toBeInTheDocument();
    expect(queryByText('General')).toBeInTheDocument();
  });
});
