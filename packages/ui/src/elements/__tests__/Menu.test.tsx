import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { Menu, MenuItem, MenuList, MenuTrigger } from '../Menu';

const { createFixtures } = bindCreateFixtures('SignIn');

// A small wrapper around <button> that absorbs the `elementDescriptor`/`elementId` props
// that MenuTrigger injects via cloneElement, so those do not leak to the DOM as unknown
// attributes during tests.
const TestTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  const { elementDescriptor: _ed, elementId: _eid, ...rest } = props as any;
  return (
    <button
      type='button'
      ref={ref}
      {...rest}
    />
  );
});
TestTrigger.displayName = 'TestTrigger';

type HarnessItem = {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  destructive?: boolean;
  isDisabled?: boolean;
  closeAfterClick?: boolean;
};

type HarnessProps = {
  items: HarnessItem[];
  asPortal?: boolean;
  ariaLabel?: string | ((open: boolean) => string);
  triggerLabel?: string;
};

const Harness = ({ items, asPortal, ariaLabel, triggerLabel = 'Open menu' }: HarnessProps) => (
  <Menu>
    <MenuTrigger ariaLabel={ariaLabel}>
      <TestTrigger>{triggerLabel}</TestTrigger>
    </MenuTrigger>
    <MenuList asPortal={asPortal}>
      {items.map((item, i) => (
        <MenuItem
          key={i}
          onClick={item.onClick}
          destructive={item.destructive}
          isDisabled={item.isDisabled}
          closeAfterClick={item.closeAfterClick}
        >
          {item.label}
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);

describe('Menu', () => {
  describe('Regression — existing click behaviour', () => {
    it('opens the menu when the trigger is clicked', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent, queryByRole } = render(
        <Harness items={[{ label: 'First' }, { label: 'Second' }]} />,
        { wrapper },
      );

      expect(queryByRole('menu')).not.toBeInTheDocument();

      await userEvent.click(getByRole('button', { name: 'Open menu' }));

      expect(getByRole('menu')).toBeInTheDocument();
      expect(getByRole('menuitem', { name: 'First' })).toBeInTheDocument();
      expect(getByRole('menuitem', { name: 'Second' })).toBeInTheDocument();
    });

    it('closes the menu when the trigger is clicked a second time', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent, queryByRole } = render(<Harness items={[{ label: 'First' }]} />, { wrapper });

      await userEvent.click(getByRole('button', { name: 'Open menu' }));
      expect(getByRole('menu')).toBeInTheDocument();

      await userEvent.click(getByRole('button', { name: 'Open menu' }));
      expect(queryByRole('menu')).not.toBeInTheDocument();
    });

    it('fires the menu item onClick and closes the menu on selection', async () => {
      const onClick = vi.fn();
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent, queryByRole } = render(
        <Harness items={[{ label: 'Remove', onClick, destructive: true }]} />,
        { wrapper },
      );

      await userEvent.click(getByRole('button', { name: 'Open menu' }));
      await userEvent.click(getByRole('menuitem', { name: 'Remove' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(queryByRole('menu')).not.toBeInTheDocument();
    });

    it('keeps the menu open after selection when closeAfterClick is false', async () => {
      const onClick = vi.fn();
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(
        <Harness items={[{ label: 'Toggle', onClick, closeAfterClick: false }]} />,
        { wrapper },
      );

      await userEvent.click(getByRole('button', { name: 'Open menu' }));
      await userEvent.click(getByRole('menuitem', { name: 'Toggle' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(getByRole('menu')).toBeInTheDocument();
    });

    it('renders and exposes menu items when asPortal is false (inline)', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(
        <Harness
          asPortal={false}
          items={[{ label: 'First' }, { label: 'Second' }]}
        />,
        { wrapper },
      );

      await userEvent.click(getByRole('button', { name: 'Open menu' }));

      expect(getByRole('menu')).toBeInTheDocument();
      expect(getByRole('menuitem', { name: 'First' })).toBeInTheDocument();
      expect(getByRole('menuitem', { name: 'Second' })).toBeInTheDocument();
    });

    it('resolves a function-form ariaLabel that depends on isOpen', async () => {
      const ariaLabel = vi.fn((open: boolean) => (open ? 'Close actions' : 'Open actions'));
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(
        <Harness
          ariaLabel={ariaLabel}
          items={[{ label: 'First' }]}
        />,
        { wrapper },
      );

      expect(getByRole('button', { name: 'Open actions' })).toBeInTheDocument();

      await userEvent.click(getByRole('button', { name: 'Open actions' }));

      expect(getByRole('button', { name: 'Close actions' })).toBeInTheDocument();
    });
  });

  describe('Accessibility attributes', () => {
    it('sets aria-haspopup="menu" on the trigger', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole } = render(<Harness items={[{ label: 'First' }]} />, { wrapper });

      expect(getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('toggles aria-expanded on the trigger when the menu opens and closes', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(<Harness items={[{ label: 'First' }]} />, { wrapper });

      const trigger = getByRole('button', { name: 'Open menu' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await userEvent.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('exposes role="menu" on the list and role="menuitem" on each entry', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, getAllByRole, userEvent } = render(
        <Harness items={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} />,
        { wrapper },
      );

      await userEvent.click(getByRole('button', { name: 'Open menu' }));

      expect(getByRole('menu')).toBeInTheDocument();
      expect(getAllByRole('menuitem')).toHaveLength(3);
    });
  });

  describe('Keyboard interactions', () => {
    it('opens the menu when Enter is pressed on the focused trigger', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent, queryByRole } = render(<Harness items={[{ label: 'First' }]} />, { wrapper });

      expect(queryByRole('menu')).not.toBeInTheDocument();

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard('{Enter}');

      expect(getByRole('menu')).toBeInTheDocument();
    });

    it('opens the menu when Space is pressed on the focused trigger', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent, queryByRole } = render(<Harness items={[{ label: 'First' }]} />, { wrapper });

      expect(queryByRole('menu')).not.toBeInTheDocument();

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard(' ');

      expect(getByRole('menu')).toBeInTheDocument();
    });

    it('opens the menu and focuses the first item when ArrowDown is pressed on the trigger', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(<Harness items={[{ label: 'First' }, { label: 'Second' }]} />, {
        wrapper,
      });

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard('{ArrowDown}');

      expect(getByRole('menu')).toBeInTheDocument();
      await waitFor(() => expect(getByRole('menuitem', { name: 'First' })).toHaveFocus());
    });

    it('opens the menu and focuses the last item when ArrowUp is pressed on the trigger', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(
        <Harness items={[{ label: 'First' }, { label: 'Second' }, { label: 'Third' }]} />,
        { wrapper },
      );

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard('{ArrowUp}');

      expect(getByRole('menu')).toBeInTheDocument();
      await waitFor(() => expect(getByRole('menuitem', { name: 'Third' })).toHaveFocus());
    });

    it('cycles focus with ArrowDown and loops back to the first item', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(
        <Harness items={[{ label: 'First' }, { label: 'Second' }, { label: 'Third' }]} />,
        { wrapper },
      );

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'First' })).toHaveFocus());

      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'Second' })).toHaveFocus());

      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'Third' })).toHaveFocus());

      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'First' })).toHaveFocus());
    });

    it('activates the focused item on Enter and closes the menu', async () => {
      const onClick = vi.fn();
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent, queryByRole } = render(<Harness items={[{ label: 'First', onClick }]} />, {
        wrapper,
      });

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'First' })).toHaveFocus());

      await userEvent.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the menu on Escape and returns focus to the trigger', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent, queryByRole } = render(<Harness items={[{ label: 'First' }]} />, { wrapper });

      const trigger = getByRole('button', { name: 'Open menu' });
      trigger.focus();
      await userEvent.keyboard('{ArrowDown}');

      await userEvent.keyboard('{Escape}');

      expect(queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it('skips a disabled item when navigating with ArrowDown/ArrowUp', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(
        <Harness items={[{ label: 'First' }, { label: 'Second', isDisabled: true }, { label: 'Third' }]} />,
        { wrapper },
      );

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'First' })).toHaveFocus());

      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'Third' })).toHaveFocus());

      await userEvent.keyboard('{ArrowUp}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'First' })).toHaveFocus());
    });

    it('applies a roving tabIndex: only the active item is tabbable', async () => {
      const { wrapper } = await createFixtures();
      const { getByRole, userEvent } = render(<Harness items={[{ label: 'First' }, { label: 'Second' }]} />, {
        wrapper,
      });

      getByRole('button', { name: 'Open menu' }).focus();
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'First' })).toHaveFocus());

      expect(getByRole('menuitem', { name: 'First' })).toHaveAttribute('tabindex', '0');
      expect(getByRole('menuitem', { name: 'Second' })).toHaveAttribute('tabindex', '-1');

      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(getByRole('menuitem', { name: 'Second' })).toHaveFocus());

      expect(getByRole('menuitem', { name: 'First' })).toHaveAttribute('tabindex', '-1');
      expect(getByRole('menuitem', { name: 'Second' })).toHaveAttribute('tabindex', '0');
    });
  });
});
