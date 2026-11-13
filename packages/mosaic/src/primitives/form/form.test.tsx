import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Form } from './index';

describe('Form', () => {
  it('submits with an empty required field instead of stopping on native validation', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <input
          aria-label='Email'
          type='email'
          required
        />
        <button type='submit'>Continue</button>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('forwards its props and ref to the form element', () => {
    const ref = React.createRef<HTMLFormElement>();
    render(
      <Form
        ref={ref}
        id='email-form'
        aria-label='Add email'
      />,
    );

    expect(screen.getByRole('form', { name: 'Add email' })).toBe(ref.current);
    expect(ref.current).toHaveAttribute('id', 'email-form');
  });
});
