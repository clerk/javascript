import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useForm } from './index';

describe('useForm (React)', () => {
  it('renders a field and updates its value on change', () => {
    function Form() {
      const form = useForm({ defaultValues: { email: '' } });
      return (
        <form.Field name='email'>
          {field => (
            <input
              aria-label='email'
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      );
    }
    render(<Form />);
    const input = screen.getByLabelText<HTMLInputElement>('email');
    fireEvent.change(input, { target: { value: 'a@b.c' } });
    expect(input.value).toBe('a@b.c');
  });

  it('shows validation errors from a field validator', () => {
    function Form() {
      const form = useForm({ defaultValues: { email: '' } });
      return (
        <form.Field
          name='email'
          validators={{ onChange: ({ value }) => (value ? undefined : 'Required') }}
        >
          {field => (
            <>
              <input
                aria-label='email'
                value={field.state.value}
                onChange={e => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors[0] && <span role='alert'>{field.state.meta.errors[0]}</span>}
            </>
          )}
        </form.Field>
      );
    }
    render(<Form />);
    const input = screen.getByLabelText('email');
    fireEvent.change(input, { target: { value: 'x' } });
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByRole('alert').textContent).toBe('Required');
  });

  it('Subscribe re-renders only for the selected slice', () => {
    const renders = vi.fn();
    function Form() {
      const form = useForm({
        defaultValues: { email: 'seed' },
        validators: { onChange: ({ value }) => (value.email ? undefined : { fields: { email: 'Required' } }) },
      });
      return (
        <>
          <form.Field name='email'>
            {field => (
              <input
                aria-label='email'
                value={field.state.value}
                onChange={e => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <form.Subscribe selector={s => s.canSubmit}>
            {canSubmit => {
              renders(canSubmit);
              return (
                <button
                  type='submit'
                  disabled={!canSubmit}
                >
                  Submit
                </button>
              );
            }}
          </form.Subscribe>
        </>
      );
    }
    render(<Form />);
    const button = screen.getByRole<HTMLButtonElement>('button');
    const input = screen.getByLabelText<HTMLInputElement>('email');
    // initially valid (no field registered errors yet) -> canSubmit true
    expect(button.disabled).toBe(false);
    const initialRenders = renders.mock.calls.length;
    fireEvent.change(input, { target: { value: '' } }); // canSubmit true -> false
    expect(button.disabled).toBe(true);
    fireEvent.change(input, { target: { value: 'a@b.c' } }); // false -> true
    expect(button.disabled).toBe(false);
    const rendersAfterToggle = renders.mock.calls.length;
    // typing again while still valid must NOT re-render the Subscribe (slice unchanged)
    fireEvent.change(input, { target: { value: 'a@b.cd' } });
    expect(renders.mock.calls.length).toBe(rendersAfterToggle);
    expect(rendersAfterToggle - initialRenders).toBe(2); // exactly the two canSubmit flips
  });

  it('submits valid data', async () => {
    const onSubmit = vi.fn();
    function Form() {
      const form = useForm({ defaultValues: { name: 'Sam' }, onSubmit });
      return (
        <form
          onSubmit={e => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <button type='submit'>Go</button>
        </form>
      );
    }
    render(<Form />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await Promise.resolve();
    });
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { name: 'Sam' } }));
  });
});
