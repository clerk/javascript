import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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

function AsyncMenu({ onRemove = () => undefined }: { onRemove?: () => void }) {
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');
  return (
    <MosaicProvider>
      <ActionMenu
        label='Manage passkey'
        actions={[
          { label: 'Regenerate', status, onClick: () => setStatus('pending') },
          { label: 'Remove', onClick: onRemove },
        ]}
      />
      <button
        type='button'
        onClick={() => setStatus('idle')}
      >
        Finish request
      </button>
    </MosaicProvider>
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
  it('closes after an action that does not report pending', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderMenu([{ label: 'Make default', onClick }]);

    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Make default' }));

    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('keeps an opted-in action open while pending and closes immediately when it settles', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<AsyncMenu onRemove={onRemove} />);
    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Regenerate' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Regenerate' })).toHaveAttribute('aria-busy', 'true');
    expect(within(menu).getByRole('menuitem', { name: 'Remove' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(within(menu).getByRole('menuitem', { name: 'Remove' }));
    expect(onRemove).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Finish request' }));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('reserves an indicator immediately and delays its named spinner', async () => {
    const user = userEvent.setup();
    render(<AsyncMenu />);
    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    const item = await screen.findByRole('menuitem', { name: 'Regenerate' });
    expect(item.querySelector('.cl-menu-indicator')).toBeInTheDocument();
    vi.useFakeTimers();
    try {
      fireEvent.click(item);
      expect(screen.queryByRole('progressbar', { name: 'Regenerate' })).not.toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(149));
      expect(screen.queryByRole('progressbar', { name: 'Regenerate' })).not.toBeInTheDocument();
      await act(() => vi.advanceTimersByTime(1));
      expect(screen.getByRole('progressbar', { name: 'Regenerate' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Finish request' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes an opted-in action that hands off before becoming pending', async () => {
    const user = userEvent.setup();
    renderMenu([{ label: 'Open dialog', status: 'idle', onClick: () => undefined }]);
    await user.click(screen.getByRole('button', { name: 'Manage passkey' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Open dialog' }));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
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
