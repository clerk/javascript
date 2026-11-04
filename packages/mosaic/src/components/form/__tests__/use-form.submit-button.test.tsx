import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { Form } from '../../../primitives/form';
import { SubmitButton } from '../../button';
import { useForm } from '../use-form';

const atoms = (el: Element) => el.className.split(' ').filter(Boolean);

function SaveForm({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const form = useForm({ initialValues: { name: 'alex' }, onSubmit });
  return (
    <Form
      id={form.id}
      onSubmit={form.handleSubmit}
    >
      <SubmitButton
        isPending={form.isSubmitting}
        disabled={!form.canSubmit}
      >
        Save
      </SubmitButton>
    </Form>
  );
}

describe('useForm with SubmitButton', () => {
  it('shows the submit button as pending, not disabled, while the form submits', async () => {
    const { unmount } = render(<SubmitButton isPending>Save</SubmitButton>);
    const pendingAtoms = atoms(screen.getByRole('button'));
    unmount();

    const request = deferred<void>();
    render(<SaveForm onSubmit={() => request.promise} />);
    const button = screen.getByRole('button', { name: 'Save' });

    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toHaveAttribute('disabled');
    expect(atoms(button)).toEqual(pendingAtoms);

    await act(async () => {
      request.resolve();
      await request.promise;
    });
  });
});
