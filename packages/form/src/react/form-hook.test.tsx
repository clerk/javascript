import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createFormHook, createFormHookContexts, useField, useFieldGroup, useForm } from './index';

describe('useField', () => {
  it('registers and validates a standalone field', () => {
    function Form() {
      const form = useForm({ defaultValues: { email: '' } });
      const field = useField({
        form,
        name: 'email',
        validators: { onChange: ({ value }) => (value ? undefined : 'Required') },
      });
      return (
        <>
          <input
            aria-label='email'
            value={field.state.value}
            onChange={e => field.handleChange(e.target.value)}
          />
          {field.state.meta.errors[0] && <span role='alert'>{field.state.meta.errors[0]}</span>}
        </>
      );
    }
    render(<Form />);
    const input = screen.getByLabelText<HTMLInputElement>('email');
    fireEvent.change(input, { target: { value: 'x' } });
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByRole('alert').textContent).toBe('Required');
  });
});

describe('useFieldGroup', () => {
  it('projects a subset and stays reactive via Subscribe', () => {
    function Form() {
      const form = useForm({ defaultValues: { address: { street: '' } } });
      const group = useFieldGroup({ form, fields: 'address' });
      // group.get/setFieldValue are non-generic (local key in, value out), which
      // also sidesteps the deep-path cost of passing a dynamic name to form.Field.
      return (
        <form.Subscribe selector={s => s.values.address.street}>
          {street => (
            <input
              aria-label='street'
              value={street}
              onChange={e => group.setFieldValue('street', e.target.value)}
            />
          )}
        </form.Subscribe>
      );
    }
    render(<Form />);
    const input = screen.getByLabelText<HTMLInputElement>('street');
    fireEvent.change(input, { target: { value: 'Main St' } });
    expect(input.value).toBe('Main St');
  });
});

describe('createFormHook', () => {
  const { fieldContext, formContext, useFieldContext } = createFormHookContexts();
  const { useAppForm, withForm, withFieldGroup } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {},
    formComponents: {},
  });

  it('AppField provides the field via context', () => {
    function ErrorText() {
      const field = useFieldContext<{ name: string }, 'name'>();
      return field.state.meta.errors[0] ? <span role='alert'>{field.state.meta.errors[0]}</span> : null;
    }
    function Form() {
      const form = useAppForm({ defaultValues: { name: '' } });
      return (
        <form.AppField
          name='name'
          validators={{ onChange: ({ value }) => (value ? undefined : 'Required') }}
        >
          {field => (
            <>
              <input
                aria-label='name'
                value={field.state.value}
                onChange={e => field.handleChange(e.target.value)}
              />
              <ErrorText />
            </>
          )}
        </form.AppField>
      );
    }
    render(<Form />);
    const input = screen.getByLabelText<HTMLInputElement>('name');
    fireEvent.change(input, { target: { value: 'Sam' } });
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByRole('alert').textContent).toBe('Required');
  });

  it('withForm builds a reusable template rendered with a form', () => {
    const Section = withForm({
      defaultValues: { name: '' },
      render: ({ form }) => (
        <form.AppField name='name'>
          {field => (
            <input
              aria-label='name'
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
            />
          )}
        </form.AppField>
      ),
    });
    function App() {
      const form = useAppForm({ defaultValues: { name: 'Ada' } });
      return <Section form={form} />;
    }
    render(<App />);
    expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe('Ada');
  });

  it('withFieldGroup builds a reusable section bound to a subset', () => {
    const Address = withFieldGroup({
      render: ({ group }) => <span data-testid='street'>{String(group.getFieldValue('street'))}</span>,
    });
    function App() {
      const form = useAppForm({ defaultValues: { address: { street: 'Main St' } } });
      return (
        <Address
          form={form}
          fields='address'
        />
      );
    }
    render(<App />);
    expect(screen.getByTestId('street').textContent).toBe('Main St');
  });
});
