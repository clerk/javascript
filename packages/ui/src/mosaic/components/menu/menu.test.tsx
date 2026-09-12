import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { Menu } from './menu';

const scrollClasses = stylex.props(...scrollAreaViewport()).className?.split(' ') ?? [];
// The popup shares the root's atoms (both are `min-height: 0` flex columns), so only what the
// viewport adds on top of them — the mask, the overflow, the scrollbar — distinguishes the two.
const rootClasses = stylex.props(scrollAreaRoot).className?.split(' ') ?? [];
// StyleX atoms are content-hashed, so an identical declaration here resolves to the same atom the
// styles module emits. jsdom has no stylesheet, so the class is the only thing there is to assert on.
// The debug class alongside it is derived from the source filename, so only the atoms can match.
const noShrinkClass = (stylex.props(stylex.create({ base: { flexShrink: 0 } }).base).className ?? '')
  .split(' ')
  .filter(name => /^x[a-z0-9]+$/.test(name));
const viewportOnlyClasses = scrollClasses.filter(name => !rootClasses.includes(name));

function renderMenu(props?: { onSignOut?: () => void }) {
  return render(
    <Menu.Root>
      <Menu.Trigger />
      <Menu.Popup>
        <Menu.Item label='Add workspace'>
          <Menu.Media>
            <svg data-testid='add-icon' />
          </Menu.Media>
          <Menu.Label>Add workspace</Menu.Label>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          label='Sign out'
          onClick={props?.onSignOut}
        >
          <Menu.Label>Sign out</Menu.Label>
        </Menu.Item>
      </Menu.Popup>
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
        <Menu.Popup>
          <Menu.Item label='Add workspace'>
            <Menu.Label>Add workspace</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
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
    expect(screen.getByRole('menuitem', { name: 'Add workspace' })).toHaveAttribute('data-color', 'neutral');
    expect(screen.getByRole('separator')).toHaveClass('cl-menu-separator');
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
  });

  it('scrolls the items in a viewport inside the popup, not on the popup itself', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button'));

    const popup = screen.getByRole('menu').querySelector('.cl-menu-popup');
    const viewport = popup?.querySelector('.cl-menu-viewport');
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveClass(...scrollClasses);
    // The chrome must NOT carry them: `scrollAreaViewport()` masks the element it lands on, and a
    // mask on the popup would clip its own background and drop shadow.
    expect(viewportOnlyClasses).not.toHaveLength(0);
    expect(viewportOnlyClasses.filter(name => popup?.classList.contains(name))).toEqual([]);
    expect(screen.getByRole('menuitem', { name: 'Sign out' }).closest('.cl-menu-viewport')).toBe(viewport);
  });

  it('holds row height inside the capped viewport rather than letting flex squash it', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button'));

    // The viewport is a height-capped flex column. With flex's default shrink the rows compress to
    // fit the cap instead of overflowing it, so the menu loses both its row height and its scroll.
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveClass(...noShrinkClass);
    expect(screen.getByRole('separator')).toHaveClass(...noShrinkClass);
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
        <Menu.Popup>
          <Menu.Item
            label='Sign out'
            disabled
            onClick={onClick}
          >
            <Menu.Label>Sign out</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    const item = screen.getByRole('menuitem', { name: 'Sign out' });
    expect(item).toHaveAttribute('aria-disabled', 'true');

    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('reflects negative color on the item', () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger />
        <Menu.Popup>
          <Menu.Item
            label='Delete user'
            color='negative'
          >
            <Menu.Media>
              <svg data-testid='delete-icon' />
            </Menu.Media>
            <Menu.Label>Delete user</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    expect(screen.getByRole('menuitem', { name: 'Delete user' })).toHaveAttribute('data-color', 'negative');
    expect(screen.getByTestId('delete-icon').closest('.cl-menu-item')).toBeInTheDocument();
  });

  it('merges consumer className and style onto the popup and items', async () => {
    const user = userEvent.setup();
    render(
      <Menu.Root>
        <Menu.Trigger />
        <Menu.Popup
          className='my-popup'
          style={{ marginTop: '8px' }}
        >
          <Menu.Item
            label='Sign out'
            className='my-item'
          >
            <Menu.Label>Sign out</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    await user.click(screen.getByRole('button'));

    const popup = screen.getByRole('menu').querySelector('.cl-menu-popup');
    expect(popup).toHaveClass('cl-menu-popup', 'my-popup');
    expect(popup).toHaveStyle({ marginTop: '8px' });
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveClass('cl-menu-item', 'my-item');
  });

  it('renders the media slot as a span, so it is valid inside the item button', () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger />
        <Menu.Popup>
          <Menu.Item label='Add workspace'>
            <Menu.Media>
              <svg data-testid='add-icon' />
            </Menu.Media>
            <Menu.Label>Add workspace</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    const media = screen.getByTestId('add-icon').parentElement;
    expect(media?.tagName).toBe('SPAN');
    expect(media).toHaveClass('cl-menu-media');
    expect(media?.parentElement).toHaveClass('cl-menu-item');
  });

  it('holds the media column even where an item leads with nothing', () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger />
        <Menu.Popup>
          <Menu.Item label='Sign out'>
            <Menu.Media />
            <Menu.Label>Sign out</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    // The empty slot must not name the item, or every unillustrated row would read differently.
    expect(screen.getByRole('menuitem', { name: 'Sign out' }).querySelector('.cl-menu-media')).toBeInTheDocument();
  });

  it('forwards the media ref and swaps its element via render', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger />
        <Menu.Popup>
          <Menu.Item label='Sign out'>
            <Menu.Media
              ref={ref}
              render={props => <i {...props} />}
            />
            <Menu.Label>Sign out</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    expect(ref.current?.tagName).toBe('I');
    expect(ref.current).toHaveClass('cl-menu-media');
  });

  it('renders the label as a span inside the item, and names it', () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger />
        <Menu.Popup>
          <Menu.Item label='colin@clerk.dev'>
            <Menu.Media />
            <Menu.Label>colin@clerk.dev</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    const label = screen.getByRole('menuitem', { name: 'colin@clerk.dev' }).querySelector('.cl-menu-label');
    expect(label?.tagName).toBe('SPAN');
    expect(label).toHaveTextContent('colin@clerk.dev');
  });

  it('sizes the media to sm by default, and reflects the size it is given', () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger />
        <Menu.Popup>
          <Menu.Item label='Sign out'>
            <Menu.Media />
            <Menu.Label>Sign out</Menu.Label>
          </Menu.Item>
          <Menu.Item label='colin@clerk.dev'>
            <Menu.Media size='xs' />
            <Menu.Label>colin@clerk.dev</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );

    const mediaOf = (name: string) => screen.getByRole('menuitem', { name }).querySelector('.cl-menu-media');

    expect(mediaOf('Sign out')).toHaveAttribute('data-size', 'sm');
    expect(mediaOf('colin@clerk.dev')).toHaveAttribute('data-size', 'xs');
  });

  it('forwards the trigger ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Menu.Root>
        <Menu.Trigger ref={ref} />
        <Menu.Popup>
          <Menu.Item label='Sign out'>
            <Menu.Label>Sign out</Menu.Label>
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
  });
});
