import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import type { AddContactDialogViewProps } from '../dialogs/add-contact-dialog.view';
import { AddContactDialogView } from '../dialogs/add-contact-dialog.view';
import type { AddContactFlowState } from '../dialogs/flow.types';

const RESEND = { isResending: false, secondsRemaining: 0 };

function actions() {
  return {
    onValueChange: vi.fn(),
    onSubmitIdentifier: vi.fn(),
    onCodeChange: vi.fn(),
    onSubmitCode: vi.fn(),
    onResend: vi.fn(),
    onOpenSsoPopup: vi.fn(),
    onCancel: vi.fn(),
  };
}

function renderView(state: AddContactFlowState, overrides: Partial<AddContactDialogViewProps> = {}) {
  const handlers = actions();
  render(
    <MosaicProvider>
      <Dialog defaultOpen>
        <AddContactDialogView
          kind='email'
          state={state}
          {...handlers}
          {...overrides}
        />
      </Dialog>
    </MosaicProvider>,
  );
  return handlers;
}

describe('AddContactDialogView', () => {
  describe('identifier step', () => {
    it('keeps submit disabled until the value is longer than a single character', async () => {
      renderView({ step: 'identifier', value: 'a', isSubmitting: false, errors: {} });

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('submits the identifier', async () => {
      const handlers = renderView({ step: 'identifier', value: 'new@clerk.dev', isSubmitting: false, errors: {} });

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(handlers.onSubmitIdentifier).toHaveBeenCalledOnce();
    });

    it('renders a field error in the field and an unattributed error above the form', () => {
      renderView({
        step: 'identifier',
        value: 'taken@clerk.dev',
        isSubmitting: false,
        errors: { field: 'That email address is taken.', form: 'Something went wrong.' },
      });

      expect(screen.getByText('That email address is taken.')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
    });

    it('locks the field and shows progress while submitting', () => {
      renderView({ step: 'identifier', value: 'new@clerk.dev', isSubmitting: true, errors: {} });

      expect(screen.getByRole('textbox')).toBeDisabled();
      // The label stays put and the button announces itself busy, rather than swapping its text
      // and reflowing the footer mid-request.
      expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('progressbar', { name: 'Adding' })).toBeInTheDocument();
    });

    it('goes inert behind a stacked reverification challenge', () => {
      renderView(
        { step: 'identifier', value: 'new@clerk.dev', isSubmitting: false, errors: {} },
        { isInterrupted: true },
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('renders a country picker alongside the number for a phone', () => {
      renderView({ step: 'identifier', value: '+1', isSubmitting: false, errors: {} }, { kind: 'phone' });

      expect(screen.getByRole('combobox', { name: 'Country' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Add phone number' })).toBeInTheDocument();
    });
  });

  describe('preparing step', () => {
    it('names the artefact being sent', () => {
      renderView({ step: 'preparing', identifier: 'new@clerk.dev', strategy: 'email_link' });

      expect(screen.getByText(/Sending a verification link to/)).toBeInTheDocument();
    });
  });

  describe('code step', () => {
    const codeState = {
      step: 'code',
      identifier: 'new@clerk.dev',
      strategy: 'email_code',
      code: '',
      status: 'idle',
      errors: {},
      resend: RESEND,
    } as const;

    it('auto-submits once the final digit lands', async () => {
      const handlers = renderView(codeState);

      // Pasted rather than typed: the view is controlled, so a spy `onCodeChange` never feeds the
      // digits back and typing would never reach a sixth character.
      await userEvent.click(screen.getByRole('textbox', { name: 'Verification code' }));
      await userEvent.paste('424242');

      expect(handlers.onCodeChange).toHaveBeenCalledWith('424242');
      expect(handlers.onSubmitCode).toHaveBeenCalledOnce();
    });

    it('ignores non-digits and stops at the code length', async () => {
      const handlers = renderView(codeState);

      await userEvent.click(screen.getByRole('textbox', { name: 'Verification code' }));
      await userEvent.paste('42-4242-99');

      expect(handlers.onCodeChange).toHaveBeenCalledWith('424242');
    });

    it('reports a wrong code and keeps the field editable', () => {
      renderView({ ...codeState, status: 'error', errors: { field: 'Incorrect code. Please try again.' } });

      expect(screen.getByText('Incorrect code. Please try again.')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Verification code' })).not.toBeDisabled();
    });

    it('locks the field while verifying', () => {
      renderView({ ...codeState, code: '424242', status: 'verifying' });

      expect(screen.getByRole('textbox', { name: 'Verification code' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Verify' })).toHaveAttribute('aria-busy', 'true');
    });

    it('resends on request', async () => {
      const handlers = renderView(codeState);

      await userEvent.click(screen.getByRole('button', { name: 'Resend' }));

      expect(handlers.onResend).toHaveBeenCalledOnce();
    });
  });

  describe('link step', () => {
    it('waits for the click and counts the resend cooldown down', () => {
      renderView({
        step: 'link',
        identifier: 'new@clerk.dev',
        resend: { isResending: false, secondsRemaining: 42 },
        errors: {},
      });

      expect(screen.getByText('Check your email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Resend link (42s)' })).toHaveAttribute('aria-disabled', 'true');
    });

    it.each([
      ['expired', 'This verification link has expired'],
      ['failed', 'This verification link is invalid'],
      ['verified_other_tab', 'Successfully verified email address'],
    ] as const)('renders the %s outcome', (outcome, heading) => {
      renderView({ step: 'link', identifier: 'new@clerk.dev', resend: RESEND, outcome, errors: {} });

      expect(screen.getByText(heading)).toBeInTheDocument();
      expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
    });
  });

  describe('sso step', () => {
    it('offers the provider and then waits on it', async () => {
      const handlers = renderView({
        step: 'sso',
        identifier: 'dev@acmecorp.com',
        providerName: 'Okta',
        status: 'idle',
        errors: {},
      });

      await userEvent.click(screen.getByRole('button', { name: 'Continue with Okta' }));

      expect(handlers.onOpenSsoPopup).toHaveBeenCalledOnce();
    });

    it('offers a retry after a failed popup', () => {
      renderView({
        step: 'sso',
        identifier: 'dev@acmecorp.com',
        providerName: 'Okta',
        status: 'error',
        errors: { form: 'Verification was cancelled or failed.' },
      });

      expect(screen.getByRole('alert')).toHaveTextContent('Verification was cancelled or failed.');
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });
  });

  describe('success step', () => {
    it('confirms the contact was added', async () => {
      const handlers = renderView({ step: 'success', identifier: 'new@clerk.dev' });

      expect(screen.getByText(/was added to your account/)).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Done' }));
      expect(handlers.onCancel).toHaveBeenCalledOnce();
    });
  });
});
