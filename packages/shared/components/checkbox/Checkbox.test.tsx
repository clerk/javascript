import { render, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Checkbox } from './Checkbox';

describe('<Checkbox/>', () => {
  it('renders the checkbox and be clickable between states', async () => {
    // mock onChange function
    const onChange = jest.fn();

    const { rerender } = render(
      <Checkbox
        checked={false}
        handleChange={onChange}
      />,
    );

    // checkbox and parent label components
    const checkbox = screen.getAllByRole('checkbox')[0];

    // // checked=false should mean it's unchecked
    expect(checkbox).toHaveProperty('checked', false);

    // // Clicking from off -> on
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    // // // checked=true should mean it's checked
    rerender(
      <Checkbox
        checked
        handleChange={onChange}
      />,
    );
    expect(checkbox).toHaveProperty('checked', true);

    // // Clicking from on -> off
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });
});
