import { render, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Switch } from './Switch';

describe('<Switch/>', () => {
  it('renders the switch and toggles it between states', async () => {
    const handleChangeSpy = jest.fn();

    const { rerender } = render(
      <Switch
        checked={false}
        handleChange={handleChangeSpy}
      />,
    );
    const radio = screen.getByRole('radio', { checked: false });

    // Clicking from off -> on
    await userEvent.click(radio);

    await waitFor(() => {
      expect(handleChangeSpy).toHaveBeenCalledTimes(1);
    });

    rerender(
      <Switch
        checked
        handleChange={handleChangeSpy}
      />,
    );
    expect(radio).toHaveProperty('checked', true);

    // Clicking from on -> off
    await userEvent.click(radio);
    // TODO: onChange should have been called twice. Investigate further.
    await waitFor(() => {
      expect(handleChangeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
