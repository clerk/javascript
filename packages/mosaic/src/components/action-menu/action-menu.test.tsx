import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pen } from '../../icons/glyphs/pen';
import { MosaicProvider } from '../../mosaic-provider';
import { ActionMenu } from './action-menu';

function renderMenu(actions: Parameters<typeof ActionMenu>[0]['actions']) {
  return render(
    <MosaicProvider>
      <ActionMenu
        label='Manage passkey'
        actions={actions}
      />
    </MosaicProvider>,
  );
}

describe('Mosaic ActionMenu', () => {
  it('renders nothing when there are no actions', () => {
    renderMenu([]);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('names its trigger and runs the action picked from it', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderMenu([
      { label: 'Rename', icon: Pen, onClick },
      { label: 'Remove', color: 'negative', onClick: vi.fn() },
    ]);

    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));

    expect(onClick).toHaveBeenCalledOnce();
  });
  it('keeps a disabled trigger focusable without allowing pointer or keyboard activation', async () => {
    const onClick = vi.fn();
    render(
      <MosaicProvider>
        <ActionMenu
          label='Manage wallet'
          actions={[{ label: 'Remove', onClick }]}
          disabled
          focusableWhenDisabled
        />
      </MosaicProvider>,
    );
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Manage wallet' });
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await user.click(trigger);
    expect(screen.queryByRole('menu')).toBeNull();
    await user.keyboard('{Enter} {ArrowDown}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disables both the trigger and existing menu items while busy', async () => {
    const onClick = vi.fn();
    const actions = [{ label: 'Remove', onClick }];
    const view = render(
      <MosaicProvider>
        <ActionMenu
          label='Manage wallet'
          actions={actions}
        />
      </MosaicProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Manage wallet' }));
    expect(await screen.findByRole('menuitem', { name: 'Remove' })).toBeInTheDocument();

    view.rerender(
      <MosaicProvider>
        <ActionMenu
          label='Manage wallet'
          actions={actions}
          disabled
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Manage wallet' })).toBeDisabled();
    const remove = screen.getByRole('menuitem', { name: 'Remove' });
    expect(remove).toHaveAttribute('aria-disabled', 'true');
    await user.click(remove);
    expect(onClick).not.toHaveBeenCalled();
  });
});
