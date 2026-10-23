import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
      { label: 'Rename', icon: 'pen', onClick },
      { label: 'Remove', color: 'negative', onClick: vi.fn() },
    ]);

    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));

    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
  it('closes a progress action that settles before pending renders', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderMenu([{ label: 'Make default', progress: 'idle', onClick }]);

    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Make default' }));

    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('keeps an eligible action visible but inert until its handler exists', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const view = renderMenu([{ label: 'Rename', disabled: true }]);
    const trigger = screen.getByRole('button', { name: 'Manage passkey' });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    await user.keyboard('{Tab}{Enter}');
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).not.toBeInTheDocument();

    view.rerender(
      <MosaicProvider>
        <ActionMenu
          label='Manage passkey'
          actions={[{ label: 'Rename', onClick }]}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    expect(onClick).toHaveBeenCalledOnce();
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
