import { render, renderJSON, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import React from 'react';
import { FieldState } from 'ui/common';

import { Password } from './Password';

describe('<Password/>', () => {
  const passwordInput = {
    error: undefined,
    name: 'password',
    value: 'Pa$$word!3',
    setValue: jest.fn(),
    setError: jest.fn(),
  } as FieldState<string>;

  it('renders the password form component', async () => {
    const tree = renderJSON(
      <Password
        handleSubmit={jest.fn()}
        password={passwordInput}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the password form, enters a password and presses the button', async () => {
    const mockSubmit = jest.fn();

    render(
      <Password
        handleSubmit={mockSubmit}
        password={passwordInput}
      />,
    );

    const inputField = screen.getByLabelText('Password');
    await userEvent.type(inputField, 'SADSD!@D23');

    const button = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      // TODO: Check for the value
      // expect(mockSubmit).toHaveBeenCalledWith({})
    });
  });
});
