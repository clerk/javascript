import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserPageViewProps } from '../user-page.view';
import { UserPageView } from '../user-page.view';

const panels: UserPageViewProps['panels'] = {
  account: { name: 'Preston Booth', username: 'prestonxyz' },
  security: { hasPassword: true },
  billing: {
    subscription: {
      planName: 'Basic Plan',
      priceLabel: '$12 / Month',
      totalDueLabel: '$12.00',
      renewsAtLabel: 'Renews Aug 26',
    },
    paymentMethods: [],
    historyItems: [],
  },
  apiKeys: {
    apiKeys: [],
    searchValue: '',
    selectedIds: [],
    onSearchChange: vi.fn(),
    onSelectionChange: vi.fn(),
  },
};

function renderView(overrides: Partial<UserPageViewProps> = {}) {
  const props: UserPageViewProps = {
    activePanel: 'account',
    panels,
    onPanelChange: vi.fn(),
    ...overrides,
  };

  return {
    ...render(
      <MosaicProvider>
        <UserPageView {...props} />
      </MosaicProvider>,
    ),
    props,
  };
}

describe('UserPageView', () => {
  it('renders the active panel and all available destinations', () => {
    renderView();

    expect(screen.getByRole('navigation', { name: 'User profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'API Keys' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Secured by')).toBeInTheDocument();
  });

  it('forwards panel changes', async () => {
    const onPanelChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPanelChange });

    await user.click(screen.getByRole('button', { name: 'Security' }));

    expect(onPanelChange).toHaveBeenCalledWith('security');
    expect(screen.queryByRole('button', { name: 'Close user profile' })).not.toBeInTheDocument();
  });

  it('only exposes supplied optional panels', () => {
    renderView({ panels: { account: panels.account } });

    expect(screen.queryByRole('button', { name: 'Security' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Billing' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'API Keys' })).not.toBeInTheDocument();
  });

  it('falls back to Account when the requested panel is unavailable', () => {
    renderView({ activePanel: 'billing', panels: { account: panels.account } });

    expect(screen.getByRole('button', { name: 'Account' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
  });

  it('can omit Clerk branding', () => {
    renderView({ renderBranding: false });

    expect(screen.queryByText('Secured by')).not.toBeInTheDocument();
  });
});
