import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from '../../components/dialog';
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

  // The compact layout is a container query against the page itself, so the page has to BE a
  // container — drop that and it never collapses, at any width.
  it('is the named container its compact layout queries', () => {
    const probe = stylex.create({ container: { containerName: 'cl-profile-page', containerType: 'inline-size' } });
    const atoms = stylex
      .props(probe.container)
      .className!.split(' ')
      .filter(name => !name.includes('__'));
    const { container } = renderView();

    expect(Array.from((container.firstChild as HTMLElement).classList)).toEqual(expect.arrayContaining(atoms));
  });

  // The shape the account profile takes as a modal: the page inside the popup, self-contained.
  it('names a panel dialog and carries its dismiss from inside the popup', () => {
    render(
      <MosaicProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Popup size='panel'>
            <UserPageView
              activePanel='account'
              panels={panels}
              onPanelChange={vi.fn()}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    // Named from inside, the way `Card.Title` names a card dialog — nothing is passed in.
    const popup = screen.getByRole('dialog', { name: 'User profile' });
    expect(popup).toContainElement(document.querySelector('.cl-profile-page'));
    // And the dismiss comes from the page too, the way `Card.Header` carries a card's.
    expect(popup).toContainElement(screen.getByRole('button', { name: 'Close' }));
    expect(popup).toContainElement(screen.getByRole('tab', { name: 'Security' }));
  });

  it('carries no dismiss standalone, or inline', () => {
    const standalone = renderView();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    standalone.unmount();

    render(
      <MosaicProvider>
        <Dialog.Root inline>
          <Dialog.Popup size='panel'>
            <UserPageView
              activePanel='account'
              panels={panels}
              onPanelChange={vi.fn()}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('drops its standalone minimum height inside a dialog, where the popup decides', () => {
    const probe = stylex.create({ floor: { minHeight: '37.5rem' } });
    const atoms = stylex
      .props(probe.floor)
      .className!.split(' ')
      .filter(name => !name.includes('__'));

    const standalone = renderView();
    expect(Array.from((standalone.container.firstChild as HTMLElement).classList)).toEqual(
      expect.arrayContaining(atoms),
    );
    standalone.unmount();

    render(
      <MosaicProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Popup size='panel'>
            <UserPageView
              activePanel='account'
              panels={panels}
              onPanelChange={vi.fn()}
            />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );
    expect(Array.from(document.querySelector('.cl-profile-page')!.classList)).not.toEqual(
      expect.arrayContaining(atoms),
    );
  });

  it('renders no heading for the dialog standalone', () => {
    renderView();

    expect(screen.queryByRole('heading', { name: 'User profile' })).not.toBeInTheDocument();
  });
});
