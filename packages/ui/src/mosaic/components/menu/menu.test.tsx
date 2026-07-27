import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Menu } from './menu';

function renderMenu(props?: { onSignOut?: () => void }) {
  return render(
    <Menu.Root>
      <Menu.Trigger />
      <Menu.Content>
        <Menu.Item
          label='Add workspace'
          icon={<svg data-testid='add-icon' />}
        />
        <Menu.Separator />
        <Menu.Item
          label='Sign out'
          onClick={props?.onSignOut}
        />
      </Menu.Content>
    </Menu.Root>,
  );
}

describe('Mosaic Menu', () => {
  it('renders a ghost sm icon Button as the default trigger', () => {
    renderMenu();
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('cl-button', 'cl-menu-trigger');
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    expect(trigger).toHaveAttribute('data-size', 'sm');
    expect(trigger).toHaveAttribute('data-shape', 'square');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('renders a consumer trigger passed via render', () => {
    render(
      <Menu.Root>
        <Menu.Trigger
          render={props => (
            <button
              type='button'
              {...props}
            />
          )}
        >
          Actions
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item label='Add workspace' />
        </Menu.Content>
      </Menu.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveClass('cl-menu-trigger');
    expect(trigger).not.toHaveClass('cl-button');
  });

  it('keeps the menu closed until the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderMenu();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    // `role="menu"` sits on the positioner (floating-ui owns it); the popup is the surface inside.
    expect(screen.getByRole('menu')).toHaveClass('cl-menu-positioner');
    expect(screen.getByRole('menu').querySelector('.cl-menu-popup')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Add workspace' })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toHaveClass('cl-menu-separator');
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
  });

  it('calls an item handler and closes the menu on click', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    renderMenu({ onSignOut });

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('marks a disabled item as aria-disabled and skips its handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger />
        <Menu.Content>
          <Menu.Item
            label='Sign out'
            disabled
            onClick={onClick}
          />
        </Menu.Content>
      </Menu.Root>,
    );

    const item = screen.getByRole('menuitem', { name: 'Sign out' });
    expect(item).toHaveAttribute('aria-disabled', 'true');

    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('merges consumer className and style onto the popup and items', async () => {
    const user = userEvent.setup();
    render(
      <Menu.Root>
        <Menu.Trigger />
        <Menu.Content
          className='my-popup'
          style={{ marginTop: '8px' }}
        >
          <Menu.Item
            label='Sign out'
            className='my-item'
          />
        </Menu.Content>
      </Menu.Root>,
    );

    await user.click(screen.getByRole('button'));

    const popup = screen.getByRole('menu').querySelector('.cl-menu-popup');
    expect(popup).toHaveClass('cl-menu-popup', 'my-popup');
    expect(popup).toHaveStyle({ marginTop: '8px' });
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveClass('cl-menu-item', 'my-item');
  });

  it('forwards the trigger ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Menu.Root>
        <Menu.Trigger ref={ref} />
        <Menu.Content>
          <Menu.Item label='Sign out' />
        </Menu.Content>
      </Menu.Root>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
  });
});
