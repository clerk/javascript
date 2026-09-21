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

  it('announces the copy and keeps the button named', async () => {
    const user = userEvent.setup();
    render(<CopyButton value='acme-inc' />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied'));
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('confirms the copy in a tooltip', async () => {
    const user = userEvent.setup();
    render(<CopyButton value='acme-inc' />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Copied');
    expect(tooltip.querySelector('.cl-icon')).toBeInTheDocument();
  });

  it('takes the tooltip label from copiedLabel', async () => {
    const user = userEvent.setup();
    render(
      <CopyButton
        value='acme-inc'
        copiedLabel='Slug copied'
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Slug copied'));
  });

  it('settles back after the copied state expires', async () => {
    const user = userEvent.setup();
    render(
      <CopyButton
        value='acme-inc'
        resetAfter={200}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied'));

    await waitFor(() => expect(screen.getByRole('status')).toBeEmptyDOMElement());
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

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
