import { fireEvent, render, waitFor } from '@testing-library/react';
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
        <Form.PlainInput
          {...field.props}
          {...props}
        />
        <button onClick={() => field.setError('some error')}>set error</button>
        <button onClick={() => field.setSuccess('some success')}>set success</button>
        <button onClick={() => field.setWarning('some warning')}>set warning</button>
        <button onClick={() => field.setInfo('some info')}>set info</button>
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

    const { getByRole, getByLabelText, findByTestId, container } = render(<Field />, { wrapper });

    await userEvent.click(getByRole('button', { name: /set error/i }));

    expect(await findByTestId('form-feedback-error')).toBeInTheDocument();
    expect(await findByTestId('form-feedback-error')).toHaveTextContent(/Some Error/i);

    const input = getByLabelText(/some label/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'error-firstname');

    // Verify the error message element has the correct ID
    const errorElement = container.querySelector('#error-firstname');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(/Some Error/i);
  });

  it('with info', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
      infoText: 'some info',
    });

    const { findByLabelText, findByTestId } = render(<Field actionLabel={'take action'} />, { wrapper });

    fireEvent.focus(await findByLabelText(/some label/i));
    expect(await findByTestId('form-feedback-info')).toBeInTheDocument();
    expect(await findByTestId('form-feedback-info')).toHaveTextContent(/some info/i);
  });

  it('with success feedback and aria-describedby', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole, getByLabelText, findByTestId, container } = render(<Field />, { wrapper });

    await userEvent.click(getByRole('button', { name: /set success/i }));

    expect(await findByTestId('form-feedback-success')).toBeInTheDocument();
    expect(await findByTestId('form-feedback-success')).toHaveTextContent(/Some Success/i);

    const input = getByLabelText(/some label/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'firstname-success-feedback');

    // Verify the success message element has the correct ID
    const successElement = container.querySelector('#firstname-success-feedback');
    expect(successElement).toBeInTheDocument();
    expect(successElement).toHaveTextContent(/Some Success/i);
  });

  it('transitions between error and success feedback types', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole, getByLabelText, findByTestId, container } = render(<Field />, { wrapper });

    // Start with error
    await userEvent.click(getByRole('button', { name: /set error/i }));
    expect(await findByTestId('form-feedback-error')).toBeInTheDocument();
    expect(await findByTestId('form-feedback-error')).toHaveTextContent(/Some Error/i);

    let input = getByLabelText(/some label/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'error-firstname');

    // Transition to success
    await userEvent.click(getByRole('button', { name: /set success/i }));
    expect(await findByTestId('form-feedback-success')).toBeInTheDocument();
    expect(await findByTestId('form-feedback-success')).toHaveTextContent(/Some Success/i);

    input = getByLabelText(/some label/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'firstname-success-feedback');

    // Verify success element exists with proper ID
    const successElement = container.querySelector('#firstname-success-feedback');
    expect(successElement).toBeInTheDocument();
    expect(successElement).toHaveTextContent(/Some Success/i);
  });

  it('renders the aria-live region for screen reader support', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole, container } = render(<Field />, { wrapper });

    const ariaLiveRegion = container.querySelector('[aria-live="polite"]');
    expect(ariaLiveRegion).toBeInTheDocument();

    expect(ariaLiveRegion).toHaveAttribute('aria-live', 'polite');
    expect(ariaLiveRegion).toHaveAttribute('aria-atomic', 'true');

    // It is visually hidden
    expect(ariaLiveRegion).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    });

    expect(ariaLiveRegion).toHaveTextContent('');

    await userEvent.click(getByRole('button', { name: /set error/i }));
    await waitFor(() => {
      const ariaLiveRegion = container.querySelector('[aria-live="polite"]');
      expect(ariaLiveRegion?.textContent).toMatch(/Some Error/i);
    });

    await userEvent.click(getByRole('button', { name: /set success/i }));
    await waitFor(() => {
      const ariaLiveRegion = container.querySelector('[aria-live="polite"]');
      expect(ariaLiveRegion?.textContent).toMatch(/Some Success/i);
    });
  });
});
