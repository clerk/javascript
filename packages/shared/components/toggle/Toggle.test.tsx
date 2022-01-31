import * as React from 'react';
import { render, fireEvent, screen } from '@clerk/shared/testUtils';
import { Toggle } from './Toggle';

describe('<Toggle/>', () => {
  it('renders the toggle and be clickable between states', () => {
    // mock onChange function
    const onChange = jest.fn();

    const { rerender } = render(
      <Toggle checked={false} handleChange={onChange} />
    );

    const checkbox = screen.getByRole('checkbox', { checked: false });

    // checked=false should mean it's unchecked
    expect(checkbox).toHaveProperty('checked', false);

    // Clicking from off -> on
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(<Toggle checked handleChange={onChange} />);
    expect(checkbox).toHaveProperty('checked', true);

    // Clicking from on -> off
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
