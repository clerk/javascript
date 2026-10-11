import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { Dialog } from '../dialog';
import { Section } from '../section';
import type { ProfileNavProps } from './profile';
import { Profile } from './profile';

const pageTitles: Record<string, string> = { account: 'Account', security: 'Security', billing: 'Billing' };

const searchPages: NonNullable<ProfileNavProps['search']> = [
  {
    value: 'account',
    label: 'Account',
    sections: [
      { id: 'email', label: 'Email addresses' },
      { id: 'phone', label: 'Phone numbers' },
    ],
  },
  {
    value: 'security',
    label: 'Security',
    sections: [
      { id: 'password', label: 'Password' },
      { id: 'devices', label: 'Active devices' },
      { id: 'missing', label: 'Missing section' },
    ],
  },
  { value: 'billing', label: 'Billing' },
];

function Titled({ children }: { children: string }) {
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{children}</Section.Title>
          </Section.Content>
        </Section.Header>
      </Section.Group>
    </Section.Root>
  );
}

function Surface({ initialPage = 'account' }: { initialPage?: string }) {
  const [page, setPage] = React.useState(initialPage);
  return (
    <Profile.Root
      value={page}
      onValueChange={setPage}
    >
      <Profile.Title>User profile</Profile.Title>
      <Profile.Nav search={searchPages}>
        <Profile.NavItem value='account'>Account</Profile.NavItem>
        <Profile.NavItem value='security'>Security</Profile.NavItem>
        <Profile.NavItem value='billing'>Billing</Profile.NavItem>
      </Profile.Nav>
      <Profile.Content pageTitle={pageTitles[page]}>
        <Profile.ContentPanel value='account'>
          <Profile.SearchTarget id='email'>
            <Titled>Email addresses</Titled>
          </Profile.SearchTarget>
          <Profile.SearchTarget id='phone'>
            <Titled>Phone numbers</Titled>
          </Profile.SearchTarget>
        </Profile.ContentPanel>
        <Profile.ContentPanel value='security'>
          <Profile.SearchTarget id='password'>
            <Titled>Password</Titled>
          </Profile.SearchTarget>
          <Profile.SearchTarget id='devices'>
            <Titled>Active devices</Titled>
          </Profile.SearchTarget>
          <Profile.SearchTarget id='missing'>{null}</Profile.SearchTarget>
        </Profile.ContentPanel>
        <Profile.ContentPanel value='billing'>Billing page</Profile.ContentPanel>
      </Profile.Content>
    </Profile.Root>
  );
}

function renderSurface(props: { initialPage?: string } = {}) {
  return render(
    <MosaicProvider>
      <Surface {...props} />
    </MosaicProvider>,
  );
}

function targetOf(title: string): HTMLElement {
  const target = screen.getByRole('heading', { name: title }).closest<HTMLElement>('.cl-profile-search-target');
  if (!target) {
    throw new Error(`No search target holds "${title}"`);
  }
  return target;
}

const scrollIntoView = vi.fn();

function scrolledTargets() {
  return scrollIntoView.mock.contexts.filter(
    element => element instanceof HTMLElement && element.classList.contains('cl-profile-search-target'),
  );
}

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
});

describe('Profile search', () => {
  it('shows the navigation until there is something to search for', async () => {
    const user = userEvent.setup();
    renderSurface();

    const search = screen.getByRole('combobox', { name: 'Search' });
    expect(screen.getByRole('tablist')).toBeVisible();

    await user.type(search, '   ');

    expect(screen.getByRole('tablist')).toBeVisible();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('replaces the navigation with matching sections grouped by page', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'PASS');

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    const listbox = screen.getByRole('listbox');
    const groups = within(listbox).getAllByRole('group');
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAccessibleName('Security');
    expect(
      within(groups[0])
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['Password']);
    expect(within(listbox).getByText('Pass', { selector: 'mark' })).toBeInTheDocument();
  });

  it('lists a page whose name matches', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'bill');

    const group = screen.getByRole('group', { name: 'Billing' });
    expect(
      within(group)
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['Billing']);
  });

  it('says so when nothing matches', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'zzz');

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('opens the page of a chosen section and brings the section into view', async () => {
    const user = userEvent.setup();
    renderSurface();
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'devices');
    await user.click(screen.getByRole('option', { name: 'Active devices' }));

    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(search).toHaveValue('');
    expect(screen.getByRole('tablist')).toBeVisible();
    const target = targetOf('Active devices');
    expect(scrolledTargets()).toEqual([target]);
    expect(target).toHaveFocus();
    expect(target).toHaveAttribute('data-highlighted');
    expect(targetOf('Password')).not.toHaveAttribute('data-highlighted');
  });

  it('brings a section on the open page into view', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'phone');
    await user.click(screen.getByRole('option', { name: 'Phone numbers' }));

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(targetOf('Phone numbers')).toHaveFocus();
    expect(targetOf('Phone numbers')).toHaveAttribute('data-highlighted');
  });

  it('clears the highlight once its animation ends', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'phone');
    await user.click(screen.getByRole('option', { name: 'Phone numbers' }));
    const target = targetOf('Phone numbers');
    act(() => {
      target.dispatchEvent(new Event('animationend', { bubbles: true }));
    });

    expect(target).not.toHaveAttribute('data-highlighted');
  });

  it('chooses the active result with the keyboard', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'e');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(targetOf('Phone numbers')).toHaveFocus();
  });

  it('focuses the page title when a page is chosen', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'bill');
    await user.click(screen.getByRole('option', { name: 'Billing' }));

    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Billing' })).toHaveFocus();
    expect(scrolledTargets()).toEqual([]);
  });

  it('falls back to the page title when the chosen section renders nothing', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'missing');
    await user.click(screen.getByRole('option', { name: 'Missing section' }));

    expect(screen.getByRole('heading', { name: 'Security' })).toHaveFocus();
    expect(scrolledTargets()).toEqual([]);
  });

  it('clears the search on Escape, and leaves the dialog open', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Popup variant='profile'>
            <Surface />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'pass');
    await user.keyboard('{Escape}');

    expect(search).toHaveValue('');
    expect(screen.getByRole('dialog', { name: 'User profile' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'User profile' })).not.toBeInTheDocument();
  });

  it('clears the search from its clear button', async () => {
    const user = userEvent.setup();
    renderSurface();
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'pass');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
    expect(screen.getByRole('tablist')).toBeVisible();
  });

  it('renders no search without pages to search', () => {
    render(
      <Profile.Root value='account'>
        <Profile.Title>User profile</Profile.Title>
        <Profile.Nav>
          <Profile.NavItem value='account'>Account</Profile.NavItem>
        </Profile.Nav>
        <Profile.Content pageTitle='Account'>
          <Profile.ContentPanel value='account'>Account page</Profile.ContentPanel>
        </Profile.Content>
      </Profile.Root>,
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  describe('compact', () => {
    const original = globalThis.ResizeObserver;

    afterEach(() => {
      globalThis.ResizeObserver = original;
    });

    it.each([
      ['select', 2],
      ['sheet', 3],
    ])('renders no search in the %s layout', (_layout, width) => {
      class FakeResizeObserver {
        private readonly callback: ResizeObserverCallback;
        constructor(callback: ResizeObserverCallback) {
          this.callback = callback;
        }
        observe(target: Element) {
          if (!target.classList.contains('cl-profile-sentinel')) {
            return;
          }
          Object.defineProperty(target, 'offsetWidth', { configurable: true, value: width });
          Object.defineProperty(target, 'offsetHeight', { configurable: true, value: 600 });
          this.callback([], this as unknown as ResizeObserver);
        }
        disconnect() {}
        unobserve() {}
      }
      globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;

      renderSurface();

      expect(screen.queryByRole('combobox', { name: 'Search' })).not.toBeInTheDocument();
    });
  });
});
