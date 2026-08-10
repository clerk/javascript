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

describe('Mosaic Popover', () => {
  it('renders the trigger and opens the popup on click', async () => {
    const user = userEvent.setup();
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>
          <div>Panel body</div>
        </Popover.Popup>
      </Popover.Root>,
    );

    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });

  it('renders a custom trigger through the render prop', () => {
    render(
      <Popover.Root>
        <Popover.Trigger
          render={props => (
            <a
              href='#account'
              {...props}
            >
              Open
            </a>
          )}
        />
        <Popover.Popup>Body</Popover.Popup>
      </Popover.Root>,
    );

    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('carries the mosaic slot classes on the positioner and popup', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>Body</Popover.Popup>
      </Popover.Root>,
    );

    expect(document.querySelector('.cl-popover-positioner')).toBeInTheDocument();
    expect(document.querySelector('.cl-popover-popup')).toBeInTheDocument();
  });

  it('defaults the popup to the md size and reflects it as data-size', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>Body</Popover.Popup>
      </Popover.Root>,
    );

    expect(document.querySelector('.cl-popover-popup')).toHaveAttribute('data-size', 'md');
  });

  it('reflects an explicit size as data-size', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup size='lg'>Body</Popover.Popup>
      </Popover.Root>,
    );

    expect(document.querySelector('.cl-popover-popup')).toHaveAttribute('data-size', 'lg');
  });

  it('merges consumer className and style onto the popup', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup
          className='my-popup'
          style={{ marginTop: '8px' }}
        >
          Body
        </Popover.Popup>
      </Popover.Root>,
    );

    const popup = document.querySelector('.cl-popover-popup');
    expect(popup).toHaveClass('cl-popover-popup', 'my-popup');
    expect(popup).toHaveStyle({ marginTop: '8px' });
  });

  it('closes via Popover.Close', async () => {
    const user = userEvent.setup();
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>
          <div>Body</div>
          <Popover.Close>Dismiss</Popover.Close>
        </Popover.Popup>
      </Popover.Root>,
    );

    expect(screen.getByText('Body')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('closes on an outside click and does not reopen from the same gesture', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Popover.Root>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Popup>
            <div>Body</div>
          </Popover.Popup>
        </Popover.Root>
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
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>
          <div>Body</div>
        </Popover.Popup>
      </Popover.Root>,
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
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup aria-label='Account'>
          <div>Body</div>
        </Popover.Popup>
      </Popover.Root>,
    );

    expect(screen.getByRole('dialog', { name: 'Account' })).toBeInTheDocument();
    await settle();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('warns when the dialog has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>
          <div>Body</div>
        </Popover.Popup>
      </Popover.Root>,
    );

    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    warn.mockRestore();
  });

  it('does not warn when a Popover.Title supplies the name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>
          <Popover.Title>Account</Popover.Title>
        </Popover.Popup>
      </Popover.Root>,
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
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup ref={ref}>Body</Popover.Popup>
      </Popover.Root>,
    );

    expect(ref.current).toBe(document.querySelector('.cl-popover-popup'));
  });
});
