import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Popover } from './popover';

afterEach(() => cleanup());

// The accessible-name warning is deferred by a task so `Popover.Title` can report itself.
const settle = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

const trigger = (props: React.HTMLAttributes<HTMLElement>) => (
  <button
    type='button'
    {...props}
  >
    Open
  </button>
);

describe('Mosaic Popover', () => {
  it('renders the trigger and opens the popup on click', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={trigger}>
        <div>Panel body</div>
      </Popover>,
    );

    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });

  it('carries the mosaic slot classes on the positioner and popup', () => {
    render(
      <Popover
        defaultOpen
        trigger={trigger}
      >
        <div>Body</div>
      </Popover>,
    );

    expect(document.querySelector('.cl-popover-positioner')).toBeInTheDocument();
    expect(document.querySelector('.cl-popover-popup')).toBeInTheDocument();
  });

  it('defaults the popup to the md size and reflects it as data-size', () => {
    render(
      <Popover
        defaultOpen
        trigger={trigger}
      >
        <div>Body</div>
      </Popover>,
    );

    expect(document.querySelector('.cl-popover-popup')).toHaveAttribute('data-size', 'md');
  });

  it('reflects an explicit size as data-size', () => {
    render(
      <Popover
        defaultOpen
        size='lg'
        trigger={trigger}
      >
        <div>Body</div>
      </Popover>,
    );

    expect(document.querySelector('.cl-popover-popup')).toHaveAttribute('data-size', 'lg');
  });

  it('merges consumer className and style onto a part', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger render={trigger} />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup
              className='my-popup'
              style={{ marginTop: '8px' }}
            >
              Body
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>,
    );

    const popup = screen.getByText('Body');
    expect(popup).toHaveClass('cl-popover-popup', 'my-popup');
    expect(popup).toHaveStyle({ marginTop: '8px' });
  });

  it('closes via Popover.Close', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        defaultOpen
        trigger={trigger}
      >
        <div>Body</div>
        <Popover.Close>Dismiss</Popover.Close>
      </Popover>,
    );

    expect(screen.getByText('Body')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('closes on an outside click and does not reopen from the same gesture', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Popover trigger={trigger}>
          <div>Body</div>
        </Popover>
        <div data-testid='outside'>outside</div>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Body')).toBeInTheDocument();

    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('closes when the trigger is clicked while open', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={trigger}>
        <div>Body</div>
      </Popover>,
    );

    const button = screen.getByRole('button', { name: 'Open' });
    await user.click(button);
    expect(screen.getByText('Body')).toBeInTheDocument();

    // The dismiss that closes the popup must not let the same click reopen it.
    await user.click(button);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('names the dialog from aria-label and does not warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Popover
        defaultOpen
        aria-label='Account'
        trigger={trigger}
      >
        <div>Body</div>
      </Popover>,
    );

    expect(screen.getByRole('dialog', { name: 'Account' })).toBeInTheDocument();
    await settle();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('warns when the dialog has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Popover
        defaultOpen
        trigger={trigger}
      >
        <div>Body</div>
      </Popover>,
    );

    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    warn.mockRestore();
  });

  it('does not warn when a Popover.Title supplies the name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Popover
        defaultOpen
        trigger={trigger}
      >
        <Popover.Title>Account</Popover.Title>
      </Popover>,
    );

    expect(screen.getByRole('dialog', { name: 'Account' })).toBeInTheDocument();
    await settle();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('forwards the ref to the popup element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger render={trigger} />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup ref={ref}>Body</Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>,
    );

    expect(ref.current).toBe(screen.getByText('Body'));
  });
});
