import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Menu } from './menu';

afterEach(() => cleanup());

const trigger = (props: React.HTMLAttributes<HTMLElement>) => (
  <button
    type='button'
    {...props}
  >
    Actions
  </button>
);

describe('Mosaic Menu', () => {
  it('renders the trigger and opens the menu on click', async () => {
    const user = userEvent.setup();
    render(
      <Menu trigger={trigger}>
        <Menu.Item label='Edit' />
      </Menu>,
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Actions' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('exposes menu semantics rather than the popover dialog role', () => {
    render(
      <Menu
        defaultOpen
        trigger={trigger}
      >
        <Menu.Item label='Edit' />
        <Menu.Item label='Delete' />
      </Menu>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('falls back to the label when an item has no children', () => {
    render(
      <Menu
        defaultOpen
        trigger={trigger}
      >
        <Menu.Item label='Duplicate' />
      </Menu>,
    );

    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument();
  });

  it('renders children over the label when both are supplied', () => {
    render(
      <Menu
        defaultOpen
        trigger={trigger}
      >
        <Menu.Item label='Delete'>Delete account</Menu.Item>
      </Menu>,
    );

    expect(screen.getByRole('menuitem', { name: 'Delete account' })).toBeInTheDocument();
  });

  it('carries the mosaic slot classes on the positioner, popup, and item', () => {
    render(
      <Menu
        defaultOpen
        trigger={trigger}
      >
        <Menu.Item label='Edit' />
        <Menu.Separator />
      </Menu>,
    );

    expect(document.querySelector('.cl-menu-positioner')).toBeInTheDocument();
    expect(document.querySelector('.cl-menu-popup')).toBeInTheDocument();
    expect(document.querySelector('.cl-menu-separator')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveClass('cl-menu-item');
  });

  it('marks disabled items with aria-disabled and a data attribute, and skips their onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Menu
        defaultOpen
        trigger={trigger}
      >
        <Menu.Item
          label='Delete'
          disabled
          onClick={onClick}
        />
      </Menu>,
    );

    const item = screen.getByRole('menuitem', { name: 'Delete' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveAttribute('data-disabled');

    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('moves roving focus with the arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <Menu trigger={trigger}>
        <Menu.Item label='Edit' />
        <Menu.Item label='Duplicate' />
      </Menu>,
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
  });

  it('fires onClick and closes the menu when an item is activated', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Menu
        defaultOpen
        trigger={trigger}
      >
        <Menu.Item
          label='Edit'
          onClick={onClick}
        />
      </Menu>,
    );

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('registers a submenu trigger as a single menuitem in the parent list', () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger render={trigger} />
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item label='Edit' />
              <Menu.Root>
                <Menu.SubTrigger>Share</Menu.SubTrigger>
                <Menu.Portal>
                  <Menu.Positioner>
                    <Menu.Popup>
                      <Menu.Item label='Copy link' />
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>,
    );

    // Two rows on screen, so exactly two `menuitem`s — the submenu trigger must not
    // register itself twice, or arrow-key navigation desyncs from what is visible.
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent('Share');
    expect(items[1]).toHaveClass('cl-menu-sub-trigger');
  });

  it('merges consumer className and style onto a part', () => {
    render(
      <Menu
        defaultOpen
        trigger={trigger}
      >
        <Menu.Item
          label='Edit'
          className='my-item'
          style={{ marginTop: '8px' }}
        />
      </Menu>,
    );

    const item = screen.getByRole('menuitem', { name: 'Edit' });
    expect(item).toHaveClass('cl-menu-item', 'my-item');
    expect(item).toHaveStyle({ marginTop: '8px' });
  });
});
