import * as React from 'react';
import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import { TextArea } from './TextArea';

describe('<TextArea/>', () => {
  it('handles the controlled textarea change', () => {
    const onChange = jest.fn();
    render(<TextArea handleChange={onChange} />);

    const textArea = screen.getByRole('textbox');
    userEvent.type(textArea, 'Hello, World!');

    expect(onChange).toHaveBeenCalledTimes('Hello, World!'.length);
  });

  it('renders the controlled textarea with error', () => {
    const textArea = renderJSON(<TextArea hasError />);
    expect(textArea).toMatchSnapshot();
  });
});
