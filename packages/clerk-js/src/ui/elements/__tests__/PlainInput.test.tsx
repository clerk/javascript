import { describe, it } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react';
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
    expect(getByLabelText(/some label/i)).toHaveValue('init value');
    expect(getByLabelText(/some label/i)).toHaveAttribute('required');
    expect(getByLabelText(/some label/i)).toHaveAttribute('aria-required', 'true');
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
    expect(getByLabelText(/some label/i)).not.toHaveAttribute('required');
    expect(getByLabelText(/some label/i)).toHaveAttribute('aria-required', 'false');
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

    const { getByText } = render(<Field actionLabel={'take action'} />, { wrapper });
    expect(getByText(/take action/i, { selector: 'a' })).toBeInTheDocument();
    expect(getByText(/take action/i, { selector: 'a' })).not.toHaveAttribute('rel');
    expect(getByText(/take action/i, { selector: 'a' })).not.toHaveAttribute('target');
    expect(getByText(/take action/i, { selector: 'a' })).toHaveAttribute('href', '');
  });

  it('with error', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole, getByLabelText, findByText } = render(<Field />, { wrapper });

    await userEvent.click(getByRole('button', { name: /set error/i }));

    expect(await findByText(/some error/i)).toBeInTheDocument();

    const label = getByLabelText(/some label/i);
    expect(label).toHaveAttribute('aria-invalid', 'true');
    expect(label).toHaveAttribute('aria-describedby', 'error-firstname');
  });

  it('with info', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
      infoText: 'some info',
    });

    const { findByLabelText, findByText } = render(<Field actionLabel={'take action'} />, { wrapper });

    fireEvent.focus(await findByLabelText(/some label/i));
    expect(await findByText(/some info/i)).toBeInTheDocument();
  });
});
