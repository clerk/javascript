import * as stylex from '@stylexjs/stylex';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { Dialog } from '../dialog';
import { Icon } from '../icon';
import type { ProfileRootProps } from './profile';
import { Profile } from './profile';

function Surface(rootProps: Partial<ProfileRootProps>) {
  return (
    <Profile.Root
      label='User profile'
      value='account'
      {...rootProps}
    >
      <Profile.Nav>
        <Profile.NavItem
          value='account'
          icon={<Icon name='user-circle' />}
        >
          Account
        </Profile.NavItem>
        <Profile.NavItem value='security'>Security</Profile.NavItem>
      </Profile.Nav>
      <Profile.Content>
        <Profile.Page value='account'>
          <Profile.PageTitle>Account</Profile.PageTitle>
          Account page
        </Profile.Page>
        <Profile.Page value='security'>Security page</Profile.Page>
      </Profile.Content>
    </Profile.Root>
  );
}

function renderSurface(props: Partial<ProfileRootProps> = {}) {
  return render(
    <MosaicProvider>
      <Surface {...props} />
    </MosaicProvider>,
  );
}

function atomsOf(style: stylex.StyleXStyles): string[] {
  return stylex
    .props(style)
    .className!.split(' ')
    .filter(name => !name.includes('__'));
}

describe('Profile', () => {
  it('is a labelled navigation of tabs beside the selected page', () => {
    renderSurface();

    expect(screen.getByRole('navigation', { name: 'User profile' })).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    const account = screen.getByRole('tab', { name: 'Account' });
    const page = screen.getByRole('tabpanel');
    expect(account).toHaveAttribute('aria-selected', 'true');
    expect(account).toHaveAttribute('aria-controls', page.id);
    expect(page).toHaveTextContent('Account page');
    expect(screen.getByText('Security page')).not.toBeVisible();
  });

  it('reports a selection, and moves it with the arrow keys', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderSurface({ onValueChange });

    await user.click(screen.getByRole('tab', { name: 'Security' }));
    expect(onValueChange).toHaveBeenCalledWith('security');

    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveFocus();
  });

  it('exposes its parts through stable slots and state attributes', () => {
    const { container } = renderSurface({ value: 'security', className: 'custom', style: { maxWidth: 900 } });

    expect(container.firstChild).toHaveClass('cl-profile', 'custom');
    expect(container.firstChild).toHaveStyle({ maxWidth: '900px' });
    expect(screen.getByRole('navigation')).toHaveClass('cl-profile-nav');
    expect(screen.getByRole('tablist')).toHaveClass('cl-profile-nav-list');
    const security = screen.getByRole('tab', { name: 'Security' });
    expect(security).toHaveClass('cl-profile-nav-item');
    expect(security).toHaveAttribute('data-selected');
    expect(screen.getByRole('tab', { name: 'Account' })).not.toHaveAttribute('data-selected');
    expect(screen.getByRole('tabpanel')).toHaveClass('cl-profile-page');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('data-value', 'security');
    expect(container.querySelector('.cl-profile-content')).toContainElement(screen.getByRole('tabpanel'));
  });

  // The profile is often the content of the host's own `main`, or of a dialog.
  it('claims no main landmark', () => {
    renderSurface();

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('hides a destination icon from assistive tech', () => {
    renderSurface();

    const icon = screen.getByRole('tab', { name: 'Account' }).querySelector('.cl-profile-nav-item-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toContainElement(document.querySelector('.cl-icon'));
  });

  it('signs the navigation with Clerk unless told not to', () => {
    const branded = renderSurface();
    expect(screen.getByRole('navigation')).toContainElement(screen.getByText(/Secured by/));
    expect(screen.getByRole('link', { name: 'Clerk' })).toBeInTheDocument();
    branded.unmount();

    renderSurface({ renderBranding: false });
    expect(screen.queryByText(/Secured by/)).not.toBeInTheDocument();
  });

  // The compact layout is a container query against the profile itself, so the profile has to BE
  // a container — drop that and it never collapses, at any width. The rules it drives live one
  // level in, on the frame: an element is never its own query container.
  it('is the named container its compact layout queries', () => {
    const probe = stylex.create({ container: { containerName: 'cl-profile', containerType: 'inline-size' } });
    const { container } = renderSurface();

    expect(Array.from((container.firstChild as HTMLElement).classList)).toEqual(
      expect.arrayContaining(atomsOf(probe.container)),
    );
  });

  describe('page title', () => {
    it('is a level-3 heading, and alone outside a profile', () => {
      render(
        <MosaicProvider>
          <Profile.PageTitle>Account</Profile.PageTitle>
        </MosaicProvider>,
      );
      expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toHaveClass('cl-heading');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('is a plain heading while the navigation is beside the content', () => {
      renderSurface();
      expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
    });
  });

  // Compact is measured, not styled: which box the tablist renders in is a DOM decision.
  describe('compact', () => {
    let observe: ((width: number) => void) | null = null;
    const original = globalThis.ResizeObserver;

    beforeEach(() => {
      observe = null;
      class FakeResizeObserver {
        private readonly callback: ResizeObserverCallback;
        constructor(callback: ResizeObserverCallback) {
          this.callback = callback;
        }
        observe(target: Element) {
          observe = width => {
            vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
            this.callback([], this as unknown as ResizeObserver);
          };
        }
        disconnect() {}
        unobserve() {}
      }
      globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      globalThis.ResizeObserver = original;
    });

    it('moves the tablist into a sheet the page title opens, and closes it on a choice', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderSurface({ onValueChange });
      act(() => observe?.(400));

      // Nothing in the column; the headline is the way in, and still a heading.
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      const headline = screen.getByRole('button', { name: 'Account' });
      expect(headline).toHaveAttribute('aria-expanded', 'false');
      expect(headline).toHaveAttribute('aria-haspopup', 'dialog');
      expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toContainElement(headline);

      await user.click(headline);
      const sheet = screen.getByRole('dialog', { name: 'User profile' });
      expect(sheet).toHaveClass('cl-drawer-popup');
      expect(sheet).toContainElement(screen.getByRole('tablist'));
      expect(screen.queryByText(/Secured by/)).not.toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Security' }));
      expect(onValueChange).toHaveBeenCalledWith('security');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('hands focus to the headline of the page that is showing once the sheet closes', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [value, setValue] = React.useState('account');
        return (
          <Profile.Root
            label='User profile'
            value={value}
            onValueChange={setValue}
          >
            <Profile.Nav>
              <Profile.NavItem value='account'>Account</Profile.NavItem>
              <Profile.NavItem value='security'>Security</Profile.NavItem>
            </Profile.Nav>
            <Profile.Content>
              <Profile.Page value='account'>
                <Profile.PageTitle>Account</Profile.PageTitle>
              </Profile.Page>
              <Profile.Page value='security'>
                <Profile.PageTitle>Security</Profile.PageTitle>
              </Profile.Page>
            </Profile.Content>
          </Profile.Root>
        );
      }
      render(
        <MosaicProvider>
          <Controlled />
        </MosaicProvider>,
      );
      act(() => observe?.(400));

      await user.click(screen.getByRole('button', { name: 'Account' }));
      await user.click(screen.getByRole('tab', { name: 'Security' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      await waitFor(() => expect(screen.getByRole('button', { name: 'Security' })).toHaveFocus());
    });

    it('returns the tablist to the column when the width comes back', () => {
      renderSurface();
      act(() => observe?.(400));
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      act(() => observe?.(1000));
      expect(screen.getByRole('navigation', { name: 'User profile' })).toContainElement(screen.getByRole('tablist'));
    });
  });

  describe('inside a dialog', () => {
    function renderInDialog(inline = false) {
      return render(
        <MosaicProvider>
          <Dialog.Root
            defaultOpen
            inline={inline}
          >
            <Dialog.Popup size='profile'>
              <Surface />
            </Dialog.Popup>
          </Dialog.Root>
        </MosaicProvider>,
      );
    }

    // Named from inside, the way `Card.Title` names a card dialog — nothing is passed in. And the
    // dismiss comes from the profile too, the way `Card.Header` carries a card's.
    it('names the dialog and carries its dismiss', () => {
      renderInDialog();

      const popup = screen.getByRole('dialog', { name: 'User profile' });
      expect(popup).toContainElement(document.querySelector('.cl-profile'));
      expect(popup).toContainElement(screen.getByRole('button', { name: 'Close' }));
      expect(popup).toContainElement(screen.getByRole('tab', { name: 'Security' }));
    });

    it('carries no dismiss standalone, or inline', () => {
      const standalone = renderSurface();
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'User profile' })).not.toBeInTheDocument();
      standalone.unmount();

      renderInDialog(true);
      expect(screen.getByRole('dialog', { name: 'User profile' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });

    // Switching pages must never resize the surface: standalone and inline it holds a fixed height
    // and scrolls inside; over the page the popup's height is the one that counts.
    it('holds a fixed height standalone and inline, and hands it to the popup over the page', () => {
      const probe = stylex.create({ fixed: { blockSize: '45rem' }, handed: { blockSize: 'auto' } });
      const fixed = atomsOf(probe.fixed);
      const handed = atomsOf(probe.handed);

      const frame = () => Array.from(document.querySelector('.cl-profile-layout')!.classList);

      const standalone = renderSurface();
      expect(frame()).toEqual(expect.arrayContaining(fixed));
      standalone.unmount();

      const inline = renderInDialog(true);
      expect(frame()).toEqual(expect.arrayContaining(fixed));
      inline.unmount();

      renderInDialog();
      expect(frame()).toEqual(expect.arrayContaining(handed));
    });
  });
});
