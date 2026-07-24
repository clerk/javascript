import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Popover } from './popover';

afterEach(() => cleanup());

describe('Mosaic Popover', () => {
  it('renders the trigger and opens the popup on click', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        trigger={props => (
          <button
            type='button'
            {...props}
          >
            Open
          </button>
        )}
      >
        <Popover.Content>Panel body</Popover.Content>
      </Popover>,
    );

    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });

  it('carries the mosaic slot classes on popup, content, and footer', () => {
    render(
      <Popover
        defaultOpen
        trigger={props => (
          <button
            type='button'
            {...props}
          >
            Open
          </button>
        )}
      >
        <Popover.Content>Body</Popover.Content>
        <Popover.Footer>Footer</Popover.Footer>
      </Popover>,
    );

    expect(screen.getByText('Body')).toHaveClass('cl-popover-content');
    expect(screen.getByText('Footer')).toHaveClass('cl-popover-footer');
    expect(document.querySelector('.cl-popover-popup')).toBeInTheDocument();
    expect(document.querySelector('.cl-popover-positioner')).toBeInTheDocument();
  });

  it('merges consumer className and style onto a part', () => {
    render(
      <Popover
        defaultOpen
        trigger={props => (
          <button
            type='button'
            {...props}
          >
            Open
          </button>
        )}
      >
        <Popover.Content
          className='my-content'
          style={{ marginTop: '8px' }}
        >
          Body
        </Popover.Content>
      </Popover>,
    );

    const content = screen.getByText('Body');
    expect(content).toHaveClass('cl-popover-content', 'my-content');
    expect(content).toHaveStyle({ marginTop: '8px' });
  });

  it('closes via Popover.Close', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        defaultOpen
        trigger={props => (
          <button
            type='button'
            {...props}
          >
            Open
          </button>
        )}
      >
        <Popover.Content>Body</Popover.Content>
        <Popover.Close>Dismiss</Popover.Close>
      </Popover>,
    );

    expect(screen.getByText('Body')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('forwards the ref to the content element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Popover
        defaultOpen
        trigger={props => (
          <button
            type='button'
            {...props}
          >
            Open
          </button>
        )}
      >
        <Popover.Content ref={ref}>Body</Popover.Content>
      </Popover>,
    );

    expect(ref.current).toBe(screen.getByText('Body'));
  });
});
