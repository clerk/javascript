import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DirectionProvider } from '../direction-provider';
import { Popover } from '../popover';
import { axe } from '../test-utils/axe';
import { Menu } from './index';

afterEach(() => cleanup());

describe('Menu', () => {
  describe('ARIA attributes', () => {
    it('keeps the trigger/menu aria-controls pairing intact when a custom id is passed to the positioner', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner
            id='consumer-custom-id'
            data-testid='menu-positioner'
          >
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      const trigger = screen.getByText('Actions');
      const positioner = document.querySelector('[data-testid="menu-positioner"]');

      // The menu id is owned by floating-ui: a consumer-supplied id must not
      // override it, or the trigger's aria-controls pairing would silently break.
      expect(positioner).not.toHaveAttribute('id', 'consumer-custom-id');
      expect(trigger.getAttribute('aria-controls')).toBe(positioner?.getAttribute('id'));
    });
  });

  describe('open/close', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Cut')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });

    it('lets a mouse press focus the trigger as it opens', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );
      const onFocus = vi.fn();
      screen.getByText('Actions').addEventListener('focus', onFocus);

      await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('Actions') });

      expect(onFocus).toHaveBeenCalled();
      expect(screen.getByText('Cut')).toBeInTheDocument();
    });

    it('closes on trigger click when open', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.keyboard('{Escape}');

      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
    });

    it('closes when item is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item
                label='Cut'
                onClick={onClick}
              >
                Cut
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Cut'));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
    });

    it('does not close on item click when closeOnClick=false', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item
                label='Toggle'
                closeOnClick={false}
              >
                Toggle
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Toggle'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });

    it('calls onOpenChange', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu.Root onOpenChange={onOpenChange}>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('item interaction', () => {
    it('fires onClick on item click', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item
                label='Cut'
                onClick={onClick}
              >
                Cut
              </Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Cut'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('items are buttons with role=menuitem', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      const item = screen.getByText('Cut');
      expect(item.tagName).toBe('BUTTON');
      expect(item).toHaveAttribute('role', 'menuitem');
    });
  });

  describe('disabled items', () => {
    it('marks disabled item with data-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item
                label='Cut'
                disabled
              >
                Cut
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByRole('menuitem', { name: 'Cut' })).toHaveAttribute('data-disabled', '');
    });

    it('disabled item has aria-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item
                label='Cut'
                disabled
              >
                Cut
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByRole('menuitem', { name: 'Cut' })).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not close menu when clicking disabled item', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item
                label='Cut'
                disabled
              >
                Cut
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Cut'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });

    it('does not fire the consumer onClick when clicking a disabled item', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item
                label='Delete'
                disabled
                onClick={onClick}
              >
                Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Delete'));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates items with ArrowDown', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}');

      expect(screen.getByText('Cut')).toHaveAttribute('data-active', '');
    });

    it('navigates items with ArrowUp from last to first', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}{ArrowUp}');

      expect(screen.getByText('Cut')).toHaveAttribute('data-active', '');
    });

    it('Home moves to first item', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
              <Menu.Item label='Paste'>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}{ArrowDown}{Home}');

      expect(screen.getByText('Cut')).toHaveAttribute('data-active', '');
    });

    it('End moves to last item', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
              <Menu.Item label='Paste'>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{End}');

      expect(screen.getByText('Paste')).toHaveAttribute('data-active', '');
    });
  });

  describe('focus management', () => {
    it('focuses the menu itself, not an item, when opened with a pointer', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner data-testid='menu-positioner'>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));

      expect(document.activeElement).toBe(document.querySelector('[data-testid="menu-positioner"]'));
    });

    it('focuses the first item when opened with the keyboard', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      screen.getByText('Actions').focus();
      await user.keyboard('{Enter}');
      await new Promise(r => requestAnimationFrame(r));

      expect(document.activeElement).toBe(screen.getByText('Cut'));
    });

    it('returns focus to trigger on close via Escape', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.keyboard('{Escape}');

      expect(document.activeElement).toBe(screen.getByText('Actions'));
    });

    it('returns focus to trigger on item click', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Cut'));

      expect(document.activeElement).toBe(screen.getByText('Actions'));
    });
  });

  describe('ARIA attributes', () => {
    it('trigger has aria-expanded', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      expect(screen.getByText('Actions')).toHaveAttribute('aria-expanded', 'false');

      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Actions')).toHaveAttribute('aria-expanded', 'true');
    });

    it('popup has role=menu', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('trigger has aria-haspopup', () => {
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );
      expect(screen.getByText('Actions')).toHaveAttribute('aria-haspopup');
    });

    it('items have role=menuitem', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });

    it('separator has role=separator', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Separator />
              <Menu.Item label='Paste'>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('nested menus', () => {
    it('renders submenu trigger as menuitem', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Root>
                <Menu.Trigger>Share</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item label='Email'>Email</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Root>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      const shareTrigger = screen.getByText('Share');
      expect(shareTrigger).toHaveAttribute('role', 'menuitem');
    });

    it('leaves a trigger inside a popover as a plain button', async () => {
      const user = userEvent.setup();
      render(
        <Popover.Root>
          <Popover.Trigger>Account</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Menu.Root>
                <Menu.Trigger>Actions</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item label='Sign out'>Sign out</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Root>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Root>,
      );

      await user.click(screen.getByText('Account'));

      // A popover is not a menu, so its children are not menu items. Only the floating tree is
      // shared, and that is dismissal plumbing rather than menu hierarchy.
      expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();
      expect(screen.getByText('Actions')).not.toHaveAttribute('role');
    });

    it('opens submenu via controlled open prop', () => {
      render(
        <Menu.Root defaultOpen>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Root defaultOpen>
                <Menu.Trigger>Share</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item label='Email'>Email</Menu.Item>
                    <Menu.Item label='Slack'>Slack</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Root>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Slack')).toBeInTheDocument();
    });

    it('submenu items close all menus on click', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu.Root defaultOpen>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Root defaultOpen>
                <Menu.Trigger>Share</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item
                      label='Email'
                      onClick={onClick}
                    >
                      Email
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Root>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Email'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('Escape closes only the submenu', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Root>
                <Menu.Trigger>Share</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item label='Email'>Email</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Root>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Share')).toHaveAttribute('data-open', '');

      await user.keyboard('{Escape}');

      expect(screen.getByText('Share')).toHaveAttribute('data-closed', '');
      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });

    it('opens and closes a submenu with the reading-direction arrow keys in RTL', async () => {
      const user = userEvent.setup();
      render(
        <DirectionProvider direction='rtl'>
          <Menu.Root>
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Positioner>
              <Menu.Popup>
                <Menu.Root>
                  <Menu.Trigger>Share</Menu.Trigger>
                  <Menu.Positioner>
                    <Menu.Popup>
                      <Menu.Item label='Email'>Email</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Root>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Root>
        </DirectionProvider>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Share')).not.toHaveAttribute('data-open');

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByText('Share')).toHaveAttribute('data-open', '');

      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Share')).toHaveAttribute('data-closed', '');
      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });
  });

  describe('inside a popover', () => {
    function renderMenuInPopover() {
      return render(
        <Popover.Root defaultOpen>
          <Popover.Trigger>Open popover</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Menu.Root>
                <Menu.Trigger>Actions</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item label='Cut'>Cut</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Root>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Root>,
      );
    }

    it('Escape closes only the menu', async () => {
      const user = userEvent.setup();
      renderMenuInPopover();

      await user.click(screen.getByText('Actions'));
      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');

      await user.keyboard('{Escape}');

      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
      expect(screen.getByText('Open popover')).toHaveAttribute('data-open', '');
    });

    it('Escape closes the popover once the menu is closed', async () => {
      const user = userEvent.setup();
      renderMenuInPopover();

      await user.click(screen.getByText('Actions'));
      await user.keyboard('{Escape}');
      // The whole point of the two-step: the first Escape must spend itself on the menu and leave
      // the popover up, or the second one is closing something that was already closed.
      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
      expect(screen.getByText('Open popover')).toHaveAttribute('data-open', '');

      await user.keyboard('{Escape}');

      expect(screen.getByText('Open popover')).toHaveAttribute('data-closed', '');
    });
  });

  describe('open on hover', () => {
    beforeEach(() => {
      vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
      vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    beforeEach(() => {
      vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
      vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    function renderHoverMenu(children?: React.ReactNode) {
      return render(
        <>
          <button type='button'>Elsewhere</button>
          <Menu.Root openOnHover>
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Positioner data-testid='menu-positioner'>
              <Menu.Popup>
                <Menu.Item label='Cut'>Cut</Menu.Item>
                {children}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Root>
        </>,
      );
    }

    function place(element: Element, x: number, y: number, width: number, height: number) {
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(x, y, width, height));
    }

    function positionerOf(text: string) {
      const positioner = screen.getByText(text).closest('[data-side]');
      if (!positioner) {
        throw new Error(`No positioner around ${text}`);
      }
      return positioner;
    }

    it('opens when the mouse rests on the trigger', async () => {
      const user = userEvent.setup();
      renderHoverMenu();

      await user.hover(screen.getByText('Actions'));

      expect(await screen.findByText('Cut')).toBeInTheDocument();
    });

    it('does not open on hover without openOnHover', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.hover(screen.getByText('Actions'));
      await new Promise(r => setTimeout(r, 150));

      expect(screen.queryByText('Cut')).toBeNull();
    });

    it('stays open as the mouse moves from the trigger into the menu', async () => {
      const user = userEvent.setup();
      renderHoverMenu();
      place(screen.getByText('Actions'), 0, 0, 100, 20);

      await user.pointer({ target: screen.getByText('Actions'), coords: { clientX: 50, clientY: 10 } });
      await screen.findByText('Cut');
      place(positionerOf('Cut'), 0, 24, 160, 100);
      await user.pointer([
        { target: document.documentElement, coords: { clientX: 50, clientY: 22 } },
        { target: screen.getByText('Cut'), coords: { clientX: 60, clientY: 40 } },
      ]);

      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });

    it('closes when the mouse leaves the menu', async () => {
      const user = userEvent.setup();
      renderHoverMenu();
      place(screen.getByText('Actions'), 0, 0, 100, 20);

      await user.pointer({ target: screen.getByText('Actions'), coords: { clientX: 50, clientY: 10 } });
      await screen.findByText('Cut');
      place(positionerOf('Cut'), 0, 24, 160, 100);
      await user.pointer([
        { target: document.documentElement, coords: { clientX: 50, clientY: 22 } },
        { target: screen.getByText('Cut'), coords: { clientX: 60, clientY: 40 } },
      ]);
      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');

      await user.pointer({ target: screen.getByText('Elsewhere'), coords: { clientX: 400, clientY: 400 } });

      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
    });

    it('stays open when the trigger is pressed after a hover opened it', async () => {
      const user = userEvent.setup();
      renderHoverMenu();

      await user.hover(screen.getByText('Actions'));
      await screen.findByText('Cut');
      await user.click(screen.getByText('Actions'));
      await user.hover(screen.getByText('Elsewhere'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });

    it('stays open when the mouse leaves a menu opened by a press', async () => {
      const user = userEvent.setup();
      renderHoverMenu();

      await user.pointer({ keys: '[MouseLeft]', target: screen.getByText('Actions') });
      await user.hover(screen.getByText('Elsewhere'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
    });

    it('closes on a second press of the trigger', async () => {
      const user = userEvent.setup();
      renderHoverMenu();

      await user.hover(screen.getByText('Actions'));
      await screen.findByText('Cut');
      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
    });

    it('leaves focus on the page when a hover opens it', async () => {
      const user = userEvent.setup();
      renderHoverMenu();
      const before = document.activeElement;

      await user.hover(screen.getByText('Actions'));
      await screen.findByText('Cut');
      await new Promise(r => requestAnimationFrame(r));

      expect(document.activeElement).toBe(before);
    });

    it('focuses the first item when opened with the keyboard', async () => {
      const user = userEvent.setup();
      renderHoverMenu();

      screen.getByText('Actions').focus();
      await user.keyboard('{Enter}');
      await new Promise(r => requestAnimationFrame(r));

      expect(document.activeElement).toBe(screen.getByText('Cut'));
    });

    it('opens on a tap', async () => {
      const user = userEvent.setup();
      renderHoverMenu();

      await user.pointer({ keys: '[TouchA]', target: screen.getByText('Actions') });

      expect(await screen.findByText('Cut')).toBeInTheDocument();
    });

    it('stays open while the mouse moves into a submenu', async () => {
      const user = userEvent.setup();
      renderHoverMenu(
        <Menu.Root>
          <Menu.Trigger>Share</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Copy link'>Copy link</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );
      place(screen.getByText('Actions'), 0, 0, 100, 20);

      await user.pointer({ target: screen.getByText('Actions'), coords: { clientX: 50, clientY: 10 } });
      await screen.findByText('Share');
      place(positionerOf('Cut'), 0, 24, 160, 100);
      place(screen.getByText('Share'), 4, 60, 152, 28);
      await user.pointer([
        { target: document.documentElement, coords: { clientX: 50, clientY: 22 } },
        { target: screen.getByText('Share'), coords: { clientX: 80, clientY: 74 } },
      ]);
      await screen.findByText('Copy link');
      place(positionerOf('Copy link'), 160, 56, 160, 60);
      await user.pointer([
        { target: document.documentElement, coords: { clientX: 158, clientY: 74 } },
        { target: screen.getByText('Copy link'), coords: { clientX: 200, clientY: 70 } },
      ]);

      expect(screen.getByText('Actions')).toHaveAttribute('data-open', '');
      expect(screen.getByText('Share')).toHaveAttribute('data-open', '');
    });

    it('leaves the popover it sits in open when the mouse leaves', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button type='button'>Elsewhere</button>
          <Popover.Root defaultOpen>
            <Popover.Trigger>Open popover</Popover.Trigger>
            <Popover.Positioner>
              <Popover.Popup>
                <Menu.Root openOnHover>
                  <Menu.Trigger>Actions</Menu.Trigger>
                  <Menu.Positioner>
                    <Menu.Popup>
                      <Menu.Item label='Cut'>Cut</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Root>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Root>
        </>,
      );

      await user.hover(screen.getByText('Actions'));
      await user.hover(await screen.findByText('Cut'));
      await user.hover(screen.getByText('Open popover'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-closed', '');
      expect(screen.getByText('Open popover')).toHaveAttribute('data-open', '');
    });
  });

  describe('positioner', () => {
    it('not rendered when closed', () => {
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner data-testid='menu-positioner'>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      expect(document.querySelector('[data-testid="menu-positioner"]')).not.toBeInTheDocument();
    });

    it('has data-side when open', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner data-testid='menu-positioner'>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(document.querySelector('[data-testid="menu-positioner"]')).toHaveAttribute('data-side');
    });
  });

  describe('popup', () => {
    it('holds the items at their last frame while the popup exits', async () => {
      const user = userEvent.setup();

      function Actions() {
        const [primary, setPrimary] = React.useState('home');
        return (
          <Menu.Root>
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Positioner>
              <Menu.Popup data-testid='menu-popup'>
                {primary === 'home' ? (
                  <Menu.Item
                    label='Set as primary'
                    onClick={() => setPrimary('work')}
                  >
                    Set as primary
                  </Menu.Item>
                ) : null}
                <Menu.Item label='Remove'>Remove</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Root>
        );
      }

      render(<Actions />);

      await user.click(screen.getByText('Actions'));
      const popup = screen.getByTestId('menu-popup');
      Object.defineProperty(popup, 'getAnimations', {
        value: () => [{ finished: new Promise<void>(() => {}) }],
      });

      await user.click(screen.getByText('Set as primary'));

      expect(popup).toHaveAttribute('data-closed', '');
      expect(screen.getByText('Set as primary')).toBeInTheDocument();
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      const user = userEvent.setup();
      render(
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Root>,
      );

      await user.click(screen.getByText('Actions'));

      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });
  });
});
