import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileViewProps } from '../user-profile.view';
import { UserProfileView } from '../user-profile.view';

const pages: UserProfileViewProps['pages'] = {
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

function renderView(overrides: Partial<UserProfileViewProps> = {}) {
  const props: UserProfileViewProps = {
    activePage: 'account',
    pages,
    onPageChange: vi.fn(),
    ...overrides,
  };

  return {
    ...render(
      <MosaicProvider>
        <UserProfileView {...props} />
      </MosaicProvider>,
    ),
    props,
  };
}

describe('UserProfileView', () => {
  it('renders the active page and every available destination, in order', () => {
    renderView();

    expect(screen.getByRole('navigation', { name: 'User profile' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual([
      'Account',
      'Security',
      'Billing',
      'API Keys',
    ]);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Account');
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText(/Secured by/)).toBeInTheDocument();
  });

  it('forwards page changes', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPageChange });

    await user.click(screen.getByRole('tab', { name: 'Security' }));

    expect(onPageChange).toHaveBeenCalledWith('security');
  });

  it('only lists the pages it was given content for', () => {
    renderView({ pages: { account: pages.account, apiKeys: pages.apiKeys } });

    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['Account', 'API Keys']);
  });

  it('falls back to the first page when the requested one is unavailable', () => {
    renderView({ activePage: 'billing', pages: { account: pages.account } });

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
  });

  it('adds custom pages after the built-ins and renders their content', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderView({
      onPageChange,
      customPages: [
        { label: 'Terms', path: 'terms', icon: <svg data-testid='terms-icon' />, content: <p>Terms of service</p> },
      ],
    });

    const terms = screen.getByRole('tab', { name: 'Terms' });
    expect(screen.getAllByRole('tab').at(-1)).toBe(terms);
    expect(terms).toContainElement(screen.getByTestId('terms-icon'));
    expect(screen.getByText('Terms of service')).not.toBeVisible();

    await user.click(terms);
    expect(onPageChange).toHaveBeenCalledWith('terms');
  });

  it('shows a custom page when it is the active one', () => {
    renderView({
      activePage: 'terms',
      customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms of service</p> }],
    });

    expect(screen.getByRole('tab', { name: 'Terms' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Terms of service')).toBeVisible();
  });

  it('reorders the navigation by id, leaving the unnamed behind the named', () => {
    renderView({
      customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms of service</p> }],
      pageOrder: ['terms', 'security'],
    });

    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual([
      'Terms',
      'Security',
      'Account',
      'Billing',
      'API Keys',
    ]);
  });

  it('can omit Clerk branding, and be renamed', () => {
    renderView({ renderBranding: false, label: 'Mon compte' });

    expect(screen.queryByText(/Secured by/)).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Mon compte' })).toBeInTheDocument();
  });

  // The shape the account profile takes as a modal: the profile inside the popup, self-contained.
  it('names a profile dialog and carries its dismiss from inside the popup', () => {
    render(
      <MosaicProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Popup size='profile'>
            <UserProfileView
              activePage='account'
              pages={pages}
              onPageChange={vi.fn()}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    const popup = screen.getByRole('dialog', { name: 'User profile' });
    expect(popup).toContainElement(screen.getByRole('button', { name: 'Close' }));
    expect(popup).toContainElement(screen.getByRole('tab', { name: 'Security' }));
  });
});
