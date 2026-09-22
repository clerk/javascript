import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CopyButton } from './copy-button';

describe('Mosaic CopyButton', () => {
  it('writes the value to the clipboard', async () => {
    const user = userEvent.setup();
    render(<CopyButton value='acme-inc' />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await expect(navigator.clipboard.readText()).resolves.toBe('acme-inc');
  });

  it('confirms the copy in a toast and keeps the button named', async () => {
    const user = userEvent.setup();
    render(<CopyButton value='acme-inc' />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    const toast = await screen.findByRole('dialog', { name: 'Copied' });
    expect(toast.querySelector('.cl-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('announces the copy from the region the button names', async () => {
    const user = userEvent.setup();
    render(
      <CopyButton
        value='acme-inc'
        label='Copy slug'
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy slug' }));

    expect(await screen.findByRole('region', { name: 'Copy slug' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied'));
  });

  it('takes the confirmation text from copiedLabel', async () => {
    const user = userEvent.setup();
    render(
      <CopyButton
        value='acme-inc'
        copiedLabel='Slug copied'
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('dialog', { name: 'Slug copied' })).toBeInTheDocument();
  });

  it('settles back after the confirmation expires', async () => {
    const user = userEvent.setup();
    render(
      <CopyButton
        value='acme-inc'
        resetAfter={200}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await screen.findByRole('dialog');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows one confirmation when the value is copied twice', async () => {
    const user = userEvent.setup();
    render(<CopyButton value='acme-inc' />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
  });

  it('copies through onCopy when one is given', async () => {
    const onCopy = vi.fn();
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    render(
      <CopyButton
        value='acme-inc'
        onCopy={onCopy}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(onCopy).toHaveBeenCalledWith('acme-inc');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('stays quiet when the copy fails', async () => {
    const user = userEvent.setup();
    render(
      <CopyButton
        value='acme-inc'
        onCopy={() => Promise.reject(new Error('denied'))}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
