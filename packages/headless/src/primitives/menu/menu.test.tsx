import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from '../../test-utils/axe';
import { Menu } from './menu';

afterEach(() => cleanup());

describe('Menu', () => {
  describe('slot attributes', () => {
    it('renders trigger with data-cl-slot', () => {
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );
      expect(screen.getByText('Actions')).toHaveAttribute('data-cl-slot', 'menu-trigger');
    });

    it('renders all parts with correct slot attributes when open', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Separator />
              <Menu.Item label='Paste'>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(document.querySelector('[data-cl-slot="menu-positioner"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="menu-popup"]')).toBeInTheDocument();
      expect(document.querySelectorAll('[data-cl-slot="menu-item"]')).toHaveLength(2);
      expect(document.querySelector('[data-cl-slot="menu-separator"]')).toBeInTheDocument();
    });
  });

  describe('open/close', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Cut')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toHaveAttribute('data-cl-open', '');
    });

    it('closes on trigger click when open', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-cl-closed', '');
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await user.keyboard('{Escape}');

      expect(screen.getByText('Actions')).toHaveAttribute('data-cl-closed', '');
    });

    it('closes when item is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu>
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
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Cut'));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Actions')).toHaveAttribute('data-cl-closed', '');
    });

    it('does not close on item click when closeOnClick=false', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
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
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Toggle'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-cl-open', '');
    });

    it('calls onOpenChange', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu onOpenChange={onOpenChange}>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
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
        <Menu>
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
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Cut'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('items are buttons with role=menuitem', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      const item = screen.getByText('Cut');
      expect(item.tagName).toBe('BUTTON');
      expect(item).toHaveAttribute('role', 'menuitem');
    });
  });

  describe('disabled items', () => {
    it('marks disabled item with data-cl-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
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
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(document.querySelector('[data-cl-slot="menu-item"]')).toHaveAttribute('data-cl-disabled', '');
    });

    it('disabled item has aria-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
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
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(document.querySelector('[data-cl-slot="menu-item"]')).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not close menu when clicking disabled item', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
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
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await user.click(screen.getByText('Cut'));

      expect(screen.getByText('Actions')).toHaveAttribute('data-cl-open', '');
    });
  });

  describe('keyboard navigation', () => {
    it('navigates items with ArrowDown', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}');

      expect(screen.getByText('Cut')).toHaveAttribute('data-cl-active', '');
    });

    it('navigates items with ArrowUp from last to first', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}{ArrowUp}');

      expect(screen.getByText('Cut')).toHaveAttribute('data-cl-active', '');
    });

    it('Home moves to first item', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
              <Menu.Item label='Paste'>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{ArrowDown}{ArrowDown}{Home}');

      expect(screen.getByText('Cut')).toHaveAttribute('data-cl-active', '');
    });

    it('End moves to last item', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
              <Menu.Item label='Paste'>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await new Promise(r => requestAnimationFrame(r));
      await user.keyboard('{End}');

      expect(screen.getByText('Paste')).toHaveAttribute('data-cl-active', '');
    });
  });

  describe('focus management', () => {
    it('returns focus to trigger on close via Escape', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));
      await user.keyboard('{Escape}');

      expect(document.activeElement).toBe(screen.getByText('Actions'));
    });

    it('returns focus to trigger on item click', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
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
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      expect(screen.getByText('Actions')).toHaveAttribute('aria-expanded', 'false');

      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Actions')).toHaveAttribute('aria-expanded', 'true');
    });

    it('popup has role=menu', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('trigger has aria-haspopup', () => {
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );
      expect(screen.getByText('Actions')).toHaveAttribute('aria-haspopup');
    });

    it('items have role=menuitem', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });

    it('separator has role=separator', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Separator />
              <Menu.Item label='Paste'>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('nested menus', () => {
    it('renders submenu trigger as menuitem', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu>
                <Menu.Trigger>Share</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item label='Email'>Email</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      const shareTrigger = screen.getByText('Share');
      expect(shareTrigger).toHaveAttribute('role', 'menuitem');
      expect(shareTrigger).toHaveAttribute('data-cl-slot', 'menu-trigger');
    });

    it('opens submenu via controlled open prop', () => {
      render(
        <Menu defaultOpen>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu defaultOpen>
                <Menu.Trigger>Share</Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item label='Email'>Email</Menu.Item>
                    <Menu.Item label='Slack'>Slack</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Slack')).toBeInTheDocument();
    });

    it('submenu items close all menus on click', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu defaultOpen>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu defaultOpen>
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
              </Menu>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Email'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('positioner', () => {
    it('not rendered when closed', () => {
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      expect(document.querySelector('[data-cl-slot="menu-positioner"]')).not.toBeInTheDocument();
    });

    it('has data-cl-side when open', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(document.querySelector('[data-cl-slot="menu-positioner"]')).toHaveAttribute('data-cl-side');
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Cut'>Cut</Menu.Item>
              <Menu.Item label='Copy'>Copy</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu>,
      );

      await user.click(screen.getByText('Actions'));

      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });
  });
});
