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

  it('names itself in a tooltip on hover, then confirms in the same tooltip after a copy', async () => {
    const user = userEvent.setup();
    render(<CopyButton value='acme-inc' />);

    await user.hover(screen.getByRole('button', { name: 'Copy' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy');

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Copied'));
    expect(screen.getByRole('tooltip').querySelector('.cl-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
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

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Slug copied'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Slug copied');
  });

  it('settles back to the label after the confirmation expires', async () => {
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
    expect(screen.queryByText('Copied')).not.toBeInTheDocument();
  });

  it('confirms only the most recently copied button', async () => {
    const user = userEvent.setup();
    render(
      <>
        <CopyButton
          value='first'
          label='Copy first'
        />
        <CopyButton
          value='second'
          label='Copy second'
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Copy first' }));
    await waitFor(() => expect(screen.getAllByRole('status')[0]).toHaveTextContent('Copied'));
    await user.click(screen.getByRole('button', { name: 'Copy second' }));

    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Copied'));
    expect(screen.getAllByRole('status')[0]).toBeEmptyDOMElement();
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

  it('confirms nothing when the copy fails, and hands the caller the reason', async () => {
    const onCopyError = vi.fn();
    const denied = new Error('denied');
    const user = userEvent.setup();
    render(
      <CopyButton
        value='acme-inc'
        onCopy={() => Promise.reject(denied)}
        onCopyError={onCopyError}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(onCopyError).toHaveBeenCalledWith(denied));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
