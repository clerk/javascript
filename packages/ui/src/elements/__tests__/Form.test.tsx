import type { FieldId } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { FormEventHandler } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, screen } from '@/test/utils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { CardStateProvider } from '../contexts';
import { Form } from '../Form';

const { createFixtures } = bindCreateFixtures('SignIn');

const TestForm = (props: {
  onSubmit: FormEventHandler<HTMLFormElement>;
  preserveFocusOnSubmit?: FieldId;
  isDisabled?: boolean;
}) => {
  const identifier = useFormControl('identifier', 'hello@clerk.com', { type: 'text', label: 'Identifier' });
  const password = useFormControl('password', '', { type: 'password', label: 'Password' });

  return (
    <CardStateProvider>
      <Form.Root
        onSubmit={props.onSubmit}
        preserveFocusOnSubmit={props.preserveFocusOnSubmit}
      >
        <Form.PlainInput
          {...identifier.props}
          isDisabled={props.isDisabled}
        />
        <Form.PasswordInput {...password.props} />
        <Form.SubmitButton />
      </Form.Root>
    </CardStateProvider>
  );
};

describe('Form', () => {
  it('allows non-submit buttons to take focus from the identifier', async () => {
    const { wrapper } = await createFixtures();
    const onSubmit = vi.fn();
    const { userEvent } = render(
      <TestForm
        onSubmit={onSubmit}
        preserveFocusOnSubmit='identifier'
      />,
      { wrapper },
    );
    const input = screen.getByLabelText('Identifier');
    const showPassword = screen.getByRole('button', { name: 'Show password' });
    await userEvent.click(input);
    await userEvent.click(showPassword);

    expect(showPassword).toHaveFocus();
    expect(input).not.toHaveFocus();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('preserves only the selected field and honors explicit disabling during submission', async () => {
    const { wrapper } = await createFixtures();
    const request = createDeferredPromise();
    const onSubmit = () => request.promise;
    const { userEvent, rerender } = render(
      <TestForm
        onSubmit={onSubmit}
        preserveFocusOnSubmit='identifier'
      />,
      {
        wrapper,
      },
    );
    const input = screen.getByLabelText('Identifier');
    await userEvent.click(input);
    await userEvent.click(screen.getByText('Continue'));

    expect(input).not.toBeDisabled();
    expect(input).toHaveFocus();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    await userEvent.keyboard('changed');
    expect(input).toHaveValue('hello@clerk.com');

    rerender(
      <TestForm
        onSubmit={onSubmit}
        preserveFocusOnSubmit='identifier'
        isDisabled
      />,
    );
    expect(input).toBeDisabled();
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(input).toBeDisabled();
  });

  it('keeps native disabling for forms that do not preserve focus', async () => {
    const { wrapper } = await createFixtures();
    const request = createDeferredPromise();
    const { userEvent } = render(<TestForm onSubmit={() => request.promise} />, { wrapper });
    const input = screen.getByLabelText('Identifier');
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');

    expect(input).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(input).not.toBeDisabled();
  });
});
