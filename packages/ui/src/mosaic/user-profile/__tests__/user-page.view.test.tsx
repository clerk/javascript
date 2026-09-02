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

  // The shape the account profile takes as a modal: the page IS the popup, and the dialog's own
  // parts land inside it through `children`.
  it('renders as the popup of a panel dialog, with the dialog parts inside it', () => {
    render(
      <MosaicProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Popup
            size='panel'
            aria-label='Account'
            render={
              <UserPageView
                activePanel='account'
                panels={panels}
                onPanelChange={vi.fn()}
              />
            }
          >
            <Dialog.CloseButton />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );

    const popup = screen.getByRole('dialog', { name: 'Account' });
    expect(popup).toHaveClass('cl-profile-page', 'cl-dialog-popup');
    expect(popup).toContainElement(screen.getByRole('button', { name: 'Close' }));
    expect(popup).toContainElement(screen.getByRole('tab', { name: 'Security' }));
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
          <Dialog.Popup
            size='panel'
            aria-label='Account'
            render={
              <UserPageView
                activePanel='account'
                panels={panels}
                onPanelChange={vi.fn()}
              />
            }
          />
        </Dialog.Root>
      </MosaicProvider>,
    );
    expect(Array.from(screen.getByRole('dialog').classList)).not.toEqual(expect.arrayContaining(atoms));
  });
});
