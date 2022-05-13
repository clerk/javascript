import { act, render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import * as React from 'react';

import { ButtonWithTimer } from './ButtonWithTimer';

describe('<ButtonWithTimer/>', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the button', () => {
    const tree = renderJSON(<ButtonWithTimer throttleTimeInMs={10}>Foo</ButtonWithTimer>);
    expect(tree).toMatchSnapshot();
  });

  it('is enabled by default, becomes disabled when clicked, and becomes enables again after delay', async () => {
    // https://github.com/testing-library/user-event/issues/833#issuecomment-1013632841
    const userEventInstance = userEvent.setup({ delay: null });
    render(<ButtonWithTimer throttleTimeInMs={1000}>Foo</ButtonWithTimer>);
    const btn = screen.getByRole('button');
    expect(btn).toBeEnabled();
    await userEventInstance.click(btn);
    expect(btn).toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(btn).toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(btn).toBeEnabled();
  });

  it('starts disabled if startingState is provided, becomes enabled after delay, disabled when clicked, and becomes enables again after delay', async () => {
    // https://github.com/testing-library/user-event/issues/833#issuecomment-1013632841
    const userEventInstance = userEvent.setup({ delay: null });
    render(
      <ButtonWithTimer
        throttleTimeInMs={1000}
        startingState='disabled'
      >
        Foo
      </ButtonWithTimer>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(btn).toBeEnabled();
    await userEventInstance.click(btn);
    expect(btn).toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(btn).toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(btn).toBeEnabled();
  });
});
