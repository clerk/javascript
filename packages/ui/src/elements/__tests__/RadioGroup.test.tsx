import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { useFormControl } from '@/ui/utils/useFormControl';

import { withCardStateProvider } from '../contexts';
import { Form } from '../Form';

const { createFixtures } = bindCreateFixtures('UserProfile');
const createField = (...params: Parameters<typeof useFormControl>) => {
  const MockFieldWrapper = withCardStateProvider((props: Partial<Parameters<typeof Form.PlainInput>[0]>) => {
    const field = useFormControl(...params);

    return (
      <>
        {/* @ts-ignore*/}
        <Form.RadioGroup
          {...field.props}
          {...props}
        />
        <button onClick={() => field.setError('some error')}>set error</button>
      </>
    );
  });

  return {
    Field: MockFieldWrapper,
  };
};

describe('RadioGroup', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('some-radio', '', {
      label: 'Some checkbox',
      type: 'radio',
    });

    const { getAllByRole } = render(
      <Field
        radioOptions={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
      />,
      { wrapper },
    );

    const radios = getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('value', 'one');
    expect(radios[0].nextSibling).toHaveTextContent('One');
    expect(radios[1]).toHaveAttribute('value', 'two');
    expect(radios[1].nextSibling).toHaveTextContent('Two');

    radios.forEach(radio => {
      expect(radio).not.toBeChecked();
      expect(radio).toHaveAttribute('name', 'some-radio');
      expect(radio).not.toHaveAttribute('required');
      expect(radio).not.toHaveAttribute('disabled');
    });

    expect(radios[1]).not.toBeChecked();
  });

  it('renders the component with default value', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('some-radio', 'two', {
      label: 'Some checkbox',
      type: 'radio',
    });

    const { getAllByRole } = render(
      <Field
        radioOptions={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
      />,
      { wrapper },
    );

    const radios = getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('value', 'one');
    expect(radios[0].nextSibling).toHaveTextContent('One');
    expect(radios[1]).toHaveAttribute('value', 'two');
    expect(radios[1].nextSibling).toHaveTextContent('Two');

    radios.forEach(radio => {
      expect(radio).toHaveAttribute('type', 'radio');
      expect(radio).not.toHaveAttribute('required');
      expect(radio).not.toHaveAttribute('disabled');
      expect(radio).toHaveAttribute('aria-required', 'false');
      expect(radio).toHaveAttribute('aria-disabled', 'false');
    });

    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  it('disabled', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('some-radio', 'two', {
      label: 'Some checkbox',
      type: 'radio',
    });

    const { getAllByRole } = render(
      <Field
        isDisabled
        radioOptions={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
      />,
      { wrapper },
    );

    const radios = getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).not.toHaveAttribute('required');
      expect(radio).toHaveAttribute('disabled');
      expect(radio).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('required', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('some-radio', 'two', {
      label: 'Some checkbox',
      type: 'radio',
    });

    const { getAllByRole } = render(
      <Field
        isRequired
        radioOptions={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
      />,
      { wrapper },
    );

    const radios = getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('required');
      expect(radio).toHaveAttribute('aria-required', 'true');
    });
  });

  it('with error', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('some-radio', 'two', {
      label: 'Some checkbox',
      type: 'radio',
    });

    const { getAllByRole, getByRole, findByTestId } = render(
      <Field
        radioOptions={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
      />,
      { wrapper },
    );

    await userEvent.click(getByRole('button', { name: /set error/i }));
    expect(await findByTestId('form-feedback-error')).toBeInTheDocument();
    expect(await findByTestId('form-feedback-error')).toHaveTextContent(/Some Error/i);

    const radios = getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('aria-invalid', 'true');
      expect(radio).toHaveAttribute('aria-describedby', 'error-some-radio');
    });
  });

  it('with info', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('some-radio', '', {
      type: 'radio',
      radioOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
      infoText: 'some info',
    });

    const { findByLabelText, findByTestId } = render(<Field />, { wrapper });

    fireEvent.focus(await findByLabelText(/One/i));
    expect(await findByTestId('form-feedback-info')).toBeInTheDocument();
    expect(await findByTestId('form-feedback-info')).toHaveTextContent(/some info/i);
  });
});
