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
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    const accountTab = screen.getByRole('tab', { name: 'Account' });
    const accountPanel = screen.getByRole('tabpanel');

    expect(accountTab).toHaveAttribute('aria-selected', 'true');
    expect(accountTab).toHaveAttribute('aria-controls', accountPanel.id);
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'API Keys' })).toBeInTheDocument();
    expect(accountPanel).toHaveAccessibleName('Account');
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Secured by')).toBeInTheDocument();
  });

  it('forwards panel changes', async () => {
    const onPanelChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPanelChange });

    await user.click(screen.getByRole('tab', { name: 'Security' }));

    expect(onPanelChange).toHaveBeenCalledWith('security');
    expect(screen.queryByRole('button', { name: 'Close user profile' })).not.toBeInTheDocument();
  });

  it('supports sidebar keyboard navigation through the tabs primitive', async () => {
    const onPanelChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPanelChange });

    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('tab', { name: 'Security' })).toHaveFocus();
    expect(onPanelChange).toHaveBeenCalledWith('security');
  });

  it('reflects navigation state through stable Mosaic styling hooks', () => {
    renderView({ activePanel: 'security' });

    expect(screen.getByRole('tab', { name: 'Security' })).toHaveClass('cl-profile-page-navigation-item');
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('data-selected');
    expect(screen.getByRole('tab', { name: 'Account' })).not.toHaveAttribute('data-selected');
  });

  it('merges consumer styling props onto the page root', () => {
    const { container } = renderView({ className: 'custom-page', style: { maxWidth: 900 } });

    expect(container.firstChild).toHaveClass('cl-profile-page', 'custom-page');
    expect(container.firstChild).toHaveStyle({ maxWidth: '900px' });
  });

  it('only exposes supplied optional panels', () => {
    renderView({ panels: { account: panels.account } });

    expect(screen.queryByRole('tab', { name: 'Security' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Billing' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'API Keys' })).not.toBeInTheDocument();
  });

  it('falls back to Account when the requested panel is unavailable', () => {
    renderView({ activePanel: 'billing', panels: { account: panels.account } });

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
  });

  it('can omit Clerk branding', () => {
    renderView({ renderBranding: false });

    expect(screen.queryByText('Secured by')).not.toBeInTheDocument();
  });
});
