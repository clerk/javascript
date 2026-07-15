import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationBillingPanelController } from '../organization-billing-panel.controller';

const READ = 'org:sys_billing:read';
const MANAGE = 'org:sys_billing:manage';

let permissions: string[];
let isSessionLoaded: boolean;
let environment: { commerceSettings: { billing: { organization: { enabled: boolean } } } } | undefined;

vi.mock('@clerk/shared/react', () => ({
  useSession: () => ({
    isLoaded: isSessionLoaded,
    session: { checkAuthorization: ({ permission }: { permission: string }) => permissions.includes(permission) },
  }),
}));

vi.mock('../../hooks/useMosaicEnvironment', () => ({
  useMosaicEnvironment: () => environment,
}));

beforeEach(() => {
  permissions = [READ, MANAGE];
  isSessionLoaded = true;
  environment = { commerceSettings: { billing: { organization: { enabled: true } } } };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationBillingPanelController();
  return <output data-testid='state'>{controller.status}</output>;
}

describe('useOrganizationBillingPanelController', () => {
  it('is loading until the session resolves', () => {
    isSessionLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading until the environment resolves', () => {
    environment = undefined;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is ready when the user can read billing', () => {
    permissions = [READ];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
  });

  it('is ready when the user can only manage billing', () => {
    permissions = [MANAGE];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
  });

  it('is hidden when the user can neither read nor manage billing', () => {
    permissions = [];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when organization billing is not enabled', () => {
    environment = { commerceSettings: { billing: { organization: { enabled: false } } } };
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });
});
