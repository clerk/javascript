import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Menu } from './index';

afterEach(() => cleanup());

describe('Menu in WebKit', () => {
  it('opens on the first press of a trigger that already has focus inside a focusable parent', async () => {
    render(
      <div tabIndex={-1}>
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>
                <Menu.Item label='Cut'>Cut</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();

    await userEvent.click(trigger);

    await expect.poll(() => screen.queryByRole('menu')?.contains(document.activeElement)).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeNull();
  });
});
