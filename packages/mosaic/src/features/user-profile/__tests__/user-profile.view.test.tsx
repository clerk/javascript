import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from '../../../components/dialog';
import { MosaicProvider } from '../../../mosaic-provider';
import type { UserProfileViewProps } from '../user-profile.view';
import { UserProfileView } from '../user-profile.view';
import { UserProfileBillingPanelView } from '../user-profile-billing-panel.view';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

const pages: UserProfileViewProps['pages'] = {
  account: <UserProfileProfilePanelView />,
  security: <UserProfileSecurityPanelView />,
  billing: (
    <UserProfileBillingPanelView
      subscription={{
        planName: 'Basic Plan',
        priceLabel: '$12 / Month',
        totalDueLabel: '$12.00',
        renewsAtLabel: 'Renews Aug 26',
      }}
      paymentMethods={[]}
      historyItems={[]}
    />
  ),
  apiKeys: <p>API keys content</p>,
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
    expect(screen.queryByText('Terms of service')).not.toBeInTheDocument();

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
          <Dialog.Popup variant='profile'>
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

  it('replaces the close button with a back button in a fullscreen dialog', async () => {
    const onOpenChange = vi.fn();
    render(
      <MosaicProvider>
        <Dialog.Root
          defaultOpen
          onOpenChange={onOpenChange}
        >
          <Dialog.Popup variant='fullscreen'>
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
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    const back = screen.getByRole('button', { name: 'Back to app' });
    expect(popup).toContainElement(back);

    await userEvent.setup().click(back);

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('warns when there are no pages to show', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderView({ pages: {} });

    expect(warn).toHaveBeenCalledWith('[Clerk] UserProfile has no pages to show.');
  });
  describe('with an organization', () => {
    const organization: NonNullable<UserProfileViewProps['organization']> = {
      pages: { general: <p>General content</p>, apiKeys: <p>Organization API keys content</p> },
    };

    function tabs() {
      return screen.getAllByRole('tab').map(tab => tab.textContent);
    }

    it('groups the organization pages under Organization, after the account pages', () => {
      renderView({ organization });

      expect(tabs()).toEqual(['Account', 'Security', 'Billing', 'API Keys', 'General', 'API Keys']);
      expect(screen.getByRole('tab', { name: 'Security' })).toHaveAccessibleDescription('Account');
      expect(screen.getByRole('tab', { name: 'General' })).toHaveAccessibleDescription('Organization');
    });

    it('gives the organization pages their own ids', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();
      renderView({ organization, onPageChange });

      await user.click(screen.getByRole('tab', { name: 'General' }));

      expect(onPageChange).toHaveBeenCalledWith('organization/general');
    });

    it('opens the organization page a shared id names, not the account one', () => {
      renderView({ organization, activePage: 'organization/apiKeys' });

      expect(screen.getByRole('tab', { name: 'API Keys', description: 'Organization' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByText('Organization API keys content')).toBeVisible();
      expect(screen.queryByText('API keys content')).not.toBeInTheDocument();
    });

    it('adds and orders custom pages within the organization group', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();
      renderView({
        onPageChange,
        organization: {
          ...organization,
          customPages: [{ label: 'Audit log', path: 'audit', content: <p>Audit content</p> }],
          pageOrder: ['audit'],
        },
      });

      expect(tabs()).toEqual(['Account', 'Security', 'Billing', 'API Keys', 'Audit log', 'General', 'API Keys']);
      await user.click(screen.getByRole('tab', { name: 'Audit log' }));
      expect(onPageChange).toHaveBeenCalledWith('organization/audit');
    });

    it('falls back to the first page once the organization is gone', () => {
      renderView({ activePage: 'organization/general' });

      expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
      expect(document.querySelector('.cl-profile-nav-group')).not.toBeInTheDocument();
    });
  });

  it('finds a section on a page that is not open, and opens that page', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPageChange });

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'subscr');
    const billing = screen.getByRole('group', { name: 'Billing' });
    expect(billing).toContainElement(screen.getByRole('option', { name: 'Subscription' }));

    await user.click(screen.getByRole('option', { name: 'Subscription' }));

    expect(onPageChange).toHaveBeenCalledWith('billing');
  });

  it('finds a page of your own by its keywords', async () => {
    const user = userEvent.setup();
    renderView({
      customPages: [{ label: 'Usage', path: 'usage', keywords: ['quota'], content: <p>Usage content</p> }],
    });

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'quota');

    expect(screen.getByRole('option', { name: 'Usage' })).toBeInTheDocument();
  });
});
