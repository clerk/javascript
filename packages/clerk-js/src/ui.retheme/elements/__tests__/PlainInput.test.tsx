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
        <Form.PlainInput
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

describe('PlainInput', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByLabelText } = render(<Field />, { wrapper });
    expect(getByLabelText('some label')).toHaveValue('init value');
    expect(getByLabelText('some label')).toHaveAttribute('name', 'firstname');
    expect(getByLabelText('some label')).toHaveAttribute('placeholder', 'some placeholder');
    expect(getByLabelText('some label')).toHaveAttribute('type', 'text');
    expect(getByLabelText('some label')).toHaveAttribute('id', 'firstname-field');
    expect(getByLabelText('some label')).not.toHaveAttribute('disabled');
    expect(getByLabelText('some label')).not.toHaveAttribute('required');
    expect(getByLabelText('some label')).toHaveAttribute('aria-invalid', 'false');
    expect(getByLabelText('some label')).toHaveAttribute('aria-describedby', '');
    expect(getByLabelText('some label')).toHaveAttribute('aria-required', 'false');
    expect(getByLabelText('some label')).toHaveAttribute('aria-disabled', 'false');
  });

  it('disabled', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByLabelText } = render(<Field isDisabled />, { wrapper });
    expect(getByLabelText('some label')).toHaveValue('init value');
    expect(getByLabelText('some label')).toHaveAttribute('disabled');
    expect(getByLabelText('some label')).toHaveAttribute('aria-disabled', 'true');
  });

  it('required', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByLabelText, queryByText } = render(<Field isRequired />, { wrapper });
    expect(getByLabelText('some label')).toHaveValue('init value');
    expect(getByLabelText('some label')).toHaveAttribute('required');
    expect(getByLabelText('some label')).toHaveAttribute('aria-required', 'true');
    expect(queryByText(/optional/i)).not.toBeInTheDocument();
  });

  it('optional', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByLabelText, getByText } = render(<Field isOptional />, { wrapper });
    expect(getByLabelText('some label')).not.toHaveAttribute('required');
    expect(getByLabelText('some label')).toHaveAttribute('aria-required', 'false');
    expect(getByText(/optional/i)).toBeInTheDocument();
  });

  it('with icon', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const Icon = () => <img alt='this is an icon' />;

    const { getByAltText } = render(<Field icon={Icon} />, { wrapper });
    expect(getByAltText(/this is an icon/i)).toBeInTheDocument();
  });

  it('with action label', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole } = render(<Field actionLabel={'take action'} />, { wrapper });
    expect(getByRole('link', { name: /take action/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /take action/i })).not.toHaveAttribute('rel');
    expect(getByRole('link', { name: /take action/i })).not.toHaveAttribute('target');
    expect(getByRole('link', { name: /take action/i })).toHaveAttribute('href', '');
  });

  it('with error', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole, getByLabelText, getByText } = render(<Field />, { wrapper });

    await act(() => userEvent.click(getByRole('button', { name: /set error/i })));

    await waitFor(() => {
      expect(getByLabelText('some label')).toHaveAttribute('aria-invalid', 'true');
      expect(getByLabelText('some label')).toHaveAttribute('aria-describedby', 'error-firstname');
      expect(getByText('some error')).toBeInTheDocument();
    });
  });

  it('with info', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
      infoText: 'some info',
    });

    const { getByLabelText, getByText } = render(<Field actionLabel={'take action'} />, { wrapper });
    await act(() => fireEvent.focus(getByLabelText('some label')));
    await waitFor(() => {
      expect(getByText('some info')).toBeInTheDocument();
    });
  });
});
