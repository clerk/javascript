import { describe, it } from '@jest/globals';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFormControl } from '../../utils';
import { bindCreateFixtures } from '../../utils/test/createFixtures';
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

// TODO: Remove this once FormControl is no longer used
const createFormControl = (...params: Parameters<typeof useFormControl>) => {
  const MockFieldWrapper = withCardStateProvider((props: Partial<Parameters<typeof Form.PlainInput>[0]>) => {
    const field = useFormControl(...params);

    return (
      <>
        {/* @ts-ignore*/}
        <Form.Control
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
    const { Field } = createField('some-radio', '');

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
    const { Field } = createField('some-radio', 'two');

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
    const { Field } = createField('some-radio', 'two');

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
    const { Field } = createField('some-radio', 'two');

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
    const { Field } = createField('some-radio', 'two');

    const { getAllByRole, getByRole, getByText } = render(
      <Field
        radioOptions={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
      />,
      { wrapper },
    );

    await act(() => userEvent.click(getByRole('button', { name: /set error/i })));

    await waitFor(() => {
      const radios = getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('aria-invalid', 'true');
        expect(radio).toHaveAttribute('aria-describedby', 'error-some-radio');
      });
      expect(getByText('some error')).toBeInTheDocument();
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

    const { getByLabelText, getByText } = render(<Field />, { wrapper });

    await act(() => fireEvent.focus(getByLabelText('One')));
    await waitFor(() => {
      expect(getByText('some info')).toBeInTheDocument();
    });
  });
});

/**
 * This tests ensure that the deprecated FormControl and RadioGroup continue to behave the same and nothing broke during the refactoring.
 */
describe('Form control as text', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createFormControl('some-radio', '', {
      type: 'radio',
      radioOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    });

    const { getAllByRole } = render(<Field />, { wrapper });

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
    const { Field } = createFormControl('some-radio', 'two', {
      type: 'radio',
      radioOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    });

    const { getAllByRole } = render(<Field />, { wrapper });

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
    const { Field } = createFormControl('some-radio', 'two', {
      type: 'radio',
      radioOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    });

    const { getAllByRole } = render(<Field isDisabled />, { wrapper });

    const radios = getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).not.toHaveAttribute('required');
      expect(radio).toHaveAttribute('disabled');
      expect(radio).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('required', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createFormControl('some-radio', 'two', {
      type: 'radio',
      radioOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    });

    const { getAllByRole } = render(<Field isRequired />, { wrapper });

    const radios = getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('required');
      expect(radio).toHaveAttribute('aria-required', 'true');
    });
  });

  it('with error', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createFormControl('some-radio', 'two', {
      type: 'radio',
      radioOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    });

    const { getAllByRole, getByRole, getByText } = render(<Field />, { wrapper });

    await act(() => userEvent.click(getByRole('button', { name: /set error/i })));

    await waitFor(() => {
      const radios = getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('aria-invalid', 'true');
        expect(radio).toHaveAttribute('aria-describedby', 'error-some-radio');
      });
      expect(getByText('some error')).toBeInTheDocument();
    });
  });

  it('with info', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createFormControl('some-radio', '', {
      type: 'radio',
      radioOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
      infoText: 'some info',
    });

    const { getByLabelText, getByText } = render(<Field />, { wrapper });

    await act(() => fireEvent.focus(getByLabelText('One')));
    await waitFor(() => {
      expect(getByText('some info')).toBeInTheDocument();
    });
  });
});
