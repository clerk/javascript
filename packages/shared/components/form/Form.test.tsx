import { act, render, renderJSON, screen } from '@clerk/shared/testUtils';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { Form } from './Form';

describe('<Form/>', () => {
  it('renders the form and wraps each children with a <fieldset>', () => {
    const tree = renderJSON(
      <Form>
        <div>
          <input
            type='text'
            name='foo'
            defaultValue='42'
          />
        </div>
        <div>
          <input
            type='text'
            name='bar'
            defaultValue='42'
          />
        </div>
      </Form>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders the form and its buttons', () => {
    const tree = renderJSON(
      <Form
        handleSubmit={jest.fn()}
        handleReset={jest.fn()}
        submitButtonLabel='Continue'
        resetButtonLabel='Cancel'
        submitButtonClassName='foo'
        resetButtonClassName='bar'
      >
        <div>
          <input
            type='text'
            name='foo'
            defaultValue='42'
          />
        </div>
        <div>
          <input
            type='text'
            name='bar'
            defaultValue='42'
          />
        </div>
      </Form>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders an empty form if children are null or undefined', () => {
    const tree = renderJSON(
      <Form
        handleSubmit={jest.fn()}
        handleReset={jest.fn()}
        submitButtonLabel='Continue'
        resetButtonLabel='Cancel'
        submitButtonClassName='foo'
        resetButtonClassName='bar'
      >
        {null}
        {undefined}
      </Form>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('contains buttons that reset and submit the form', async () => {
    // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning

    const resetPromise = Promise.resolve();
    const submitPromise = Promise.resolve();
    const onReset = jest.fn(() => resetPromise);
    const onSubmit = jest.fn(() => submitPromise);

    render(
      <Form
        handleReset={onReset}
        handleSubmit={onSubmit}
      >
        <div>
          <input
            type='text'
            name='foo'
            defaultValue='42'
          />
        </div>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    await act(() => resetPromise);
    expect(onReset).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await act(() => submitPromise);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
