import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { useFormControl } from '@/ui/utils/useFormControl';

import { withCardStateProvider } from '../contexts';
import type { FieldDevHintValue } from '../FieldDevHint';
import { Form } from '../Form';

let showDevModeNotice = true;
vi.mock('../../hooks/useDevMode', () => ({
  useDevMode: () => ({ showDevModeNotice }),
}));

const { createFixtures } = bindCreateFixtures('SignIn');

const onInsert = vi.fn();

const createField = (initialValue: string) =>
  withCardStateProvider(() => {
    const field = useFormControl('emailAddress', initialValue, {
      type: 'email',
      label: 'Email address',
      placeholder: 'Enter your email address',
    });

    const hint: FieldDevHintValue = {
      text: 'Testing tip',
      action: {
        label: 'Use test email',
        // Mirror the real flow: inserting sets the field to a test credential (which hides the button).
        onInsert: () => {
          onInsert();
          field.setValue('alex+clerk_test@work.com');
        },
      },
      isTestValue: value => value.includes('+clerk_test'),
    };

    // @ts-ignore -- the mock field props satisfy the runtime contract
    return (
      <Form.PlainInput
        {...field.props}
        devHint={hint}
      />
    );
  });

const button = () => ({ name: /use test email/i });

describe('FieldDevInsertButton', () => {
  beforeEach(() => {
    showDevModeNotice = true;
    onInsert.mockClear();
  });

  it('does not render outside dev mode', async () => {
    showDevModeNotice = false;
    const { wrapper } = await createFixtures();
    const Field = createField('');

    const { getByLabelText, queryByRole } = render(<Field />, { wrapper });
    await userEvent.click(getByLabelText(/email address/i));

    expect(queryByRole('button', button())).not.toBeInTheDocument();
  });

  it('is hidden until the field is focused', async () => {
    const { wrapper } = await createFixtures();
    const Field = createField('');

    const { getByLabelText, queryByRole, getByRole } = render(<Field />, { wrapper });
    expect(queryByRole('button', button())).not.toBeInTheDocument();

    await userEvent.click(getByLabelText(/email address/i));
    expect(getByRole('button', button())).toBeInTheDocument();
  });

  it('stays visible while the focused value is not a test credential', async () => {
    const { wrapper } = await createFixtures();
    const Field = createField('alex@work.com');

    const { getByLabelText, getByRole } = render(<Field />, { wrapper });
    await userEvent.click(getByLabelText(/email address/i));

    expect(getByRole('button', button())).toBeInTheDocument();
  });

  it('is hidden once the value is a test credential', async () => {
    const { wrapper } = await createFixtures();
    const Field = createField('alex+clerk_test@work.com');

    const { getByLabelText, queryByRole } = render(<Field />, { wrapper });
    await userEvent.click(getByLabelText(/email address/i));

    expect(queryByRole('button', button())).not.toBeInTheDocument();
  });

  it('invokes onInsert when clicked and then hides', async () => {
    const { wrapper } = await createFixtures();
    const Field = createField('');

    const { getByLabelText, getByRole, queryByRole } = render(<Field />, { wrapper });
    await userEvent.click(getByLabelText(/email address/i));
    await userEvent.click(getByRole('button', button()));

    expect(onInsert).toHaveBeenCalledTimes(1);
    expect(queryByRole('button', button())).not.toBeInTheDocument();
  });

  it('restores focus to the input after keyboard activation', async () => {
    const { wrapper } = await createFixtures();
    const Field = createField('');

    const { getByLabelText, getByRole } = render(<Field />, { wrapper });
    const input = getByLabelText(/email address/i);

    await userEvent.click(input);
    // Move focus to the button and activate it with the keyboard.
    await userEvent.tab();
    expect(getByRole('button', button())).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(input).toHaveFocus();
  });
});
