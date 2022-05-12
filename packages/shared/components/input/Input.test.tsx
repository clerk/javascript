import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Input } from './Input';

describe('<Input/>', () => {
  it('renders the controlled input', async () => {
    const onChange = jest.fn();

    render(
      <Input
        type='text'
        handleChange={onChange}
        placeholder='Type some text'
      />,
    );

    const htmlInput = screen.getByRole('textbox');
    expect(htmlInput).toHaveProperty('type', 'text');
    expect(htmlInput).toHaveProperty('placeholder', 'Type some text');

    await userEvent.type(htmlInput, 'Hello, World!');

    expect(onChange).toHaveBeenCalledTimes('Hello, World!'.length);
  });

  it('renders the controlled input with error', () => {
    const tree = renderJSON(
      <Input
        type='text'
        hasError
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
