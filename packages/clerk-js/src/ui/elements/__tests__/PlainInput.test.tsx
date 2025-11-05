import { fireEvent, render, screen } from '@testing-library/react';
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

    const { getByRole, getByLabelText, container } = render(<Field />, { wrapper });

    await userEvent.click(getByRole('button', { name: /set error/i }));

    await screen.findByText(/Some Error/i, { selector: '[id^="error-"]' });

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

    const { findByLabelText } = render(<Field actionLabel={'take action'} />, { wrapper });

    fireEvent.focus(await findByLabelText(/some label/i));
    await screen.findByText(/some info/i, { selector: '[id$="-info-feedback"]' });
  });

  it('with success feedback and aria-describedby', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole, getByLabelText, container } = render(<Field />, { wrapper });

    await userEvent.click(getByRole('button', { name: /set success/i }));

    await screen.findByText(/Some Success/i, { selector: '[id$="-success-feedback"]' });

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

    const { getByRole, getByLabelText, container } = render(<Field />, { wrapper });

    // Start with error
    await userEvent.click(getByRole('button', { name: /set error/i }));
    await screen.findByText(/Some Error/i, { selector: '[id^="error-"]' });

    let input = getByLabelText(/some label/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'error-firstname');

    // Transition to success
    await userEvent.click(getByRole('button', { name: /set success/i }));
    await screen.findByText(/Some Success/i, { selector: '[id$="-success-feedback"]' });

    input = getByLabelText(/some label/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'firstname-success-feedback');

    // Verify success element exists with proper ID
    const successElement = container.querySelector('#firstname-success-feedback');
    expect(successElement).toBeInTheDocument();
    expect(successElement).toHaveTextContent(/Some Success/i);
  });

  it('screen reader only live region announces feedback changes', async () => {
    const { wrapper } = await createFixtures();
    const { Field } = createField('firstname', 'init value', {
      type: 'text',
      label: 'some label',
      placeholder: 'some placeholder',
    });

    const { getByRole, container } = render(<Field />, { wrapper });

    // Pre-state: aria-live region exists and is empty
    const preRegions = container.querySelectorAll('[aria-live="polite"]');
    expect(preRegions.length).toBeGreaterThanOrEqual(1);
    const preSrOnly = Array.from(preRegions).find(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'absolute' && style.width === '1px';
    });
    expect(preSrOnly).toBeDefined();
    expect(preSrOnly?.textContent ?? '').toMatch(/^\s*$/);

    // Input is not in error and not described yet
    const inputEl = container.querySelector('input#firstname-field');
    expect(inputEl).toHaveAttribute('aria-invalid', 'false');
    expect(inputEl).not.toHaveAttribute('aria-describedby');

    // Set error feedback
    await userEvent.click(getByRole('button', { name: /set error/i }));
    await screen.findByText(/Some Error/i, { selector: '[id^="error-"]' });

    // Verify there's a screen-reader-only aria-live region with the error content
    const ariaLiveRegions = container.querySelectorAll('[aria-live="polite"]');
    expect(ariaLiveRegions.length).toBeGreaterThanOrEqual(1);

    // Find the screen reader only region (it will have the visually hidden styles)
    const srOnlyRegion = Array.from(ariaLiveRegions).find(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'absolute' && style.width === '1px';
    });
    expect(srOnlyRegion).toBeDefined();
    expect(srOnlyRegion).toHaveTextContent(/Some Error/i);

    // Transition to success
    await userEvent.click(getByRole('button', { name: /set success/i }));
    await screen.findByText(/Some Success/i, { selector: '[id$="-success-feedback"]' });

    // Verify the screen reader only region updated its content
    expect(srOnlyRegion).toHaveTextContent(/Some Success/i);

    // Verify the visible error/success elements exist with proper IDs for aria-describedby
    const errorElement = container.querySelector('#error-firstname');
    const successElement = container.querySelector('#firstname-success-feedback');

    // One should be visible, the other hidden (for animation)
    const errorVisible = errorElement && window.getComputedStyle(errorElement).visibility === 'visible';
    const successVisible = successElement && window.getComputedStyle(successElement).visibility === 'visible';

    // At least one should be visible (might be both during transition)
    expect(errorVisible || successVisible).toBe(true);
  });
});
