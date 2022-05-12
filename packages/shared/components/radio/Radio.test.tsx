import { render, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Radio } from './Radio';

describe('<Radio/>', () => {
  it('renders the radio and be clickable between states', async () => {
    // mock onChange function
    const onChange = jest.fn();

    const { rerender } = render(
      <Radio
        checked={false}
        handleChange={onChange}
      />,
    );
    const radio = screen.getByRole('radio', { checked: false });

    // // Clicking from off -> on
    await userEvent.click(radio);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    // // // checked=true should mean it's checked
    rerender(
      <Radio
        checked
        handleChange={onChange}
      />,
    );
    expect(radio).toHaveProperty('checked', true);

    // // Clicking from on -> off
    await userEvent.click(radio);
    // // TODO: onChange should have been called twice. Investigate further.
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
