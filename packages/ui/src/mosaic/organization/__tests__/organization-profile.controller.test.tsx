import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationProfileController } from '../organization-profile.controller';

let isLoaded: boolean;
let organization: { id: string; name: string } | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization, membership: null }),
  };
});

beforeEach(() => {
  isLoaded = true;
  organization = { id: 'org_1', name: 'Acme Inc' };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationProfileController();
  return <output data-testid='state'>{controller.status}</output>;
}

describe('useOrganizationProfileController', () => {
  it('is loading until useOrganization is loaded', () => {
    isLoaded = false;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is hidden when there is no active organization', () => {
    organization = null;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is ready when an organization is loaded', () => {
    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('ready');
  });
});
