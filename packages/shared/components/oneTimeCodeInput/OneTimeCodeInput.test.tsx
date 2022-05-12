import { render, renderJSON, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import * as React from 'react';

import { OneTimeCodeInput } from './OneTimeCodeInput';

const noop = () => {
  //
};

describe('<OneTimeCodeInput/>', () => {
  let onChange: jest.Mock;
  beforeEach(() => {
    onChange = jest.fn();
  });

  it('renders the component', () => {
    const result = render(
      <OneTimeCodeInput
        value={'123456'}
        setValue={onChange}
        length={6}
        verifyCodeHandler={noop}
      />,
    );
    expect(result).toBeDefined();
  });

  it('renders correct number of inputs', () => {
    const length = 6;
    render(
      <OneTimeCodeInput
        value={'123456'}
        setValue={onChange}
        length={length}
        verifyCodeHandler={noop}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toEqual(length);
  });

  it('renders inputs with correct attributes', () => {
    render(
      <OneTimeCodeInput
        value={'123456'}
        setValue={onChange}
        length={6}
        verifyCodeHandler={noop}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, i) => {
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('name', `codeInput-${i}`);
      expect(input).toHaveAttribute('inputmode', 'numeric');
      expect(input).toHaveAttribute('autocomplete', 'one-time-code');
      expect(input).toHaveAttribute('maxlength', '1');
    });
  });

  it('renders inputs with correct aria labels for numeric inputs', () => {
    render(
      <OneTimeCodeInput
        value={'123456'}
        setValue={onChange}
        length={6}
        verifyCodeHandler={noop}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, i) => {
      if (i === 0) {
        expect(input).toHaveAttribute('aria-label', 'Enter verification code. Digit 1');
      } else {
        expect(input).toHaveAttribute('aria-label', `Digit ${i + 1}`);
      }
    });
  });

  it('updates value state on keydown', async () => {
    let value = '';
    const onChange = jest.fn(val => (value = val));
    const getComponent = () => (
      <OneTimeCodeInput
        value={value}
        setValue={onChange}
        length={6}
        verifyCodeHandler={noop}
      />
    );

    const { rerender } = render(getComponent());

    const text = '123456';
    const inputs = screen.getAllByRole('textbox');
    for (const [i, input] of inputs.entries()) {
      await userEvent.type(input, text[i]);
      rerender(getComponent());
    }

    expect(onChange).toHaveBeenCalledTimes(text.length);
    expect(value).toEqual(text);
  });

  it('focuses next input when user enters a char', async () => {
    let value = '';
    const onChange = jest.fn(val => (value = val));
    const getComponent = () => (
      <OneTimeCodeInput
        value={value}
        setValue={onChange}
        length={6}
        verifyCodeHandler={noop}
      />
    );

    const { rerender } = render(getComponent());

    const text = '123';
    const inputs = screen.getAllByRole('textbox');
    for (const [i, char] of [...text].entries()) {
      await userEvent.type(inputs[i], char);
      rerender(getComponent());
      expect(inputs[i + 1]).toHaveFocus();
    }
  });

  it('handles the verified state', async () => {
    jest.useFakeTimers();
    const afterVerifyCallback = jest.fn();
    render(
      <OneTimeCodeInput
        value={'123123'}
        setValue={onChange}
        length={6}
        verifyCodeHandler={verify => {
          verify(afterVerifyCallback);
        }}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => expect(input).toHaveClass('verified'));
    jest.runOnlyPendingTimers();
    await waitFor(() => expect(afterVerifyCallback).toHaveBeenCalled());
    jest.useRealTimers();
  });

  it('handles the error state', () => {
    const errorMessage = 'some error';
    render(
      <OneTimeCodeInput
        value={'123123'}
        setValue={onChange}
        length={6}
        verifyCodeHandler={(_, reject) => {
          reject(errorMessage);
        }}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => expect(input).toHaveClass('error'));
    const errorContainer = screen.getByText(errorMessage);
    expect(errorContainer).toBeDefined();
    expect(errorContainer).toHaveClass('errorMessage');
  });

  xit('resets error state if user enters code while on error state', async () => {
    let value = '123123';
    const onChange = jest.fn(val => (value = val));
    const getComponent = () => (
      <OneTimeCodeInput
        value={value}
        setValue={onChange}
        length={6}
        verifyCodeHandler={(_, reject) => {
          reject('error message');
        }}
      />
    );

    render(getComponent());
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => expect(input).toHaveClass('error'));
    await userEvent.type(inputs[0], '1');
    inputs.forEach(input => expect(input).not.toHaveClass('error'));
  });

  it('renders the correct DOM tree', () => {
    const tree = renderJSON(
      <OneTimeCodeInput
        value={'123456'}
        setValue={noop}
        length={6}
        verifyCodeHandler={noop}
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
