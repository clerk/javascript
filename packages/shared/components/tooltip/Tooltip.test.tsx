import { act, render, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import React from 'react';

import { Tooltip } from './Tooltip';

describe('<Tooltip/>', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows/hides the tooltip in mouse interactions', async () => {
    const messageText = 'Tooltip';
    render(
      <Tooltip content={messageText}>
        <button>Hover me</button>
      </Tooltip>,
    );

    userEvent.hover(screen.getByText(/Hover me/i));

    // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
    act(() => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => expect(screen.getByText(messageText)).toBeInTheDocument());

    act(() => {
      userEvent.unhover(screen.getByText(/Hover me/i));
    });
    expect(screen.queryByText(messageText)).not.toBeInTheDocument();
  });
});
