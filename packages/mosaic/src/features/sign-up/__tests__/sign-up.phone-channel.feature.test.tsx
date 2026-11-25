import { act, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { holdRequests, VERIFICATION_CODE } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  type FapiEnvironmentOverrides,
  fapiSignUp,
} from '../../../__tests__/feature/fapi';
import { codeSent, continueButton, enterCode, renderSignUp, renderSignUpWithRouteProbe } from './sign-up.fixtures';

function phoneEnvironment(authConfig: FapiEnvironmentOverrides['auth_config'] = {}) {
  return fapiEnvironment({
    attributes: {
      email_address: { enabled: false },
      password: { enabled: false },
      phone_number: {
        enabled: true,
        required: true,
        verifications: ['phone_code'],
        used_for_first_factor: true,
        first_factors: ['phone_code'],
        verify_at_sign_up: true,
        channels: ['sms', 'whatsapp'],
      },
    },
    auth_config: authConfig,
  });
}

describe('choosing SMS or WhatsApp for the phone code', () => {
  it('sends the phone code by SMS by default', async () => {
    const { fapi, user } = await renderSignUp({ environment: phoneEnvironment() });

    await user.type(await screen.findByRole('textbox', { name: 'Phone number' }), '5555550123');
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument();
    await codeSent();
    expect(fapi.signUp.creations[0].get('strategy')).toBeNull();
    expect(fapi.signUp.preparations).toEqual(['phone_code:sms']);
  });

  it('sends the phone code over WhatsApp when the user picks it, then signs them up', async () => {
    const { fapi, user, navigate } = await renderSignUp({ environment: phoneEnvironment() });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    expect(await screen.findByRole('heading', { name: /with WhatsApp/ })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verify your WhatsApp' })).toBeInTheDocument();
    expect(fapi.signUp.creations).toHaveLength(1);
    expect(fapi.signUp.creations[0].get('strategy')).toBe('phone_code');
    expect(fapi.signUp.creations[0].get('channel')).toBe('whatsapp');
    expect(fapi.signUp.preparations).toEqual(['phone_code:whatsapp']);

    await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
    await user.keyboard(VERIFICATION_CODE);

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(fapi.client.sessions).toHaveLength(1);
  });

  it("sends the phone code over the channel the instance prefers for the number's country", async () => {
    const { fapi, user } = await renderSignUp({
      environment: phoneEnvironment({ preferred_channels: { US: 'whatsapp' } }),
    });

    await user.type(await screen.findByRole('textbox', { name: 'Phone number' }), '5555550123');
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verify your WhatsApp' })).toBeInTheDocument();
    await waitFor(() => expect(fapi.signUp.preparations).toEqual(['phone_code:whatsapp']));
    expect(fapi.signUp.creations[0].get('channel')).toBe('whatsapp');
  });

  it('shows the SMS code screen when FAPI sends the code by SMS instead of WhatsApp', async () => {
    const { user } = await renderSignUp({
      environment: phoneEnvironment(),
      signUp: { whatsAppQuotaExceeded: true },
    });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send code via SMS instead' })).toBeNull();
    await codeSent();
  });

  it('offers no WhatsApp on the continue screen and sends a code entered there by SMS', async () => {
    const { fapi, user } = await renderSignUpWithRouteProbe({
      environment: phoneEnvironment({ preferred_channels: { US: 'whatsapp' } }),
      client: { ...fapiClient(), sign_up: fapiSignUp({}) },
    });

    await user.click(screen.getByRole('button', { name: 'Open the continue route' }));

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /WhatsApp/ })).toBeNull();
    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '5555550123');
    await user.click(continueButton());

    await codeSent();
    expect(fapi.signUp.preparations).toEqual(['phone_code:sms']);
  });

  it('keeps Continue disabled on the WhatsApp phone screen until the phone number is filled', async () => {
    const { fapi, user } = await renderSignUp({ environment: phoneEnvironment() });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await screen.findByRole('heading', { name: /with WhatsApp/ });
    await user.click(continueButton());

    expect(continueButton()).toHaveAttribute('aria-disabled', 'true');
    expect(fapi.signUp.creations).toHaveLength(0);
    await user.type(screen.getByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    expect(continueButton()).not.toHaveAttribute('aria-disabled');
  });

  it('sends a prefilled value the WhatsApp phone screen does not show', async () => {
    const { fapi, user } = await renderSignUp(
      {
        environment: fapiEnvironment({
          attributes: {
            email_address: { enabled: false },
            password: { enabled: false },
            first_name: { enabled: true, required: false },
            phone_number: {
              enabled: true,
              required: true,
              verifications: ['phone_code'],
              used_for_first_factor: true,
              first_factors: ['phone_code'],
              verify_at_sign_up: true,
              channels: ['sms', 'whatsapp'],
            },
          },
        }),
      },
      { initialValues: { firstName: 'Ada' } },
    );

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());

    await codeSent();
    expect(fapi.signUp.creations[0].get('first_name')).toBe('Ada');
  });
});

describe('changing the channel or the number from the WhatsApp code screen', () => {
  it('locks the code screen while switching the code to SMS', async () => {
    const { user } = await renderSignUp({ environment: phoneEnvironment() });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());
    await codeSent();
    const hold = holdRequests('post', '/v1/client/sign_ups/:id/prepare_verification');
    await user.click(screen.getByRole('button', { name: 'Send code via SMS instead' }));
    await waitFor(() => expect(hold.requests).toHaveLength(1));

    expect(screen.getByRole('button', { name: 'Send code via SMS instead' })).toBeDisabled();
    hold.release();
    expect(await screen.findByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument();
    await codeSent();
  });

  it('leaves a wrong WhatsApp code error behind when the code is sent by SMS instead', async () => {
    const { fapi, user } = await renderSignUp({ environment: phoneEnvironment() });
    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());
    await enterCode(user, '111111');
    expect(await screen.findByText('Incorrect code')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Send code via SMS instead' }));

    expect(await screen.findByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument();
    await waitFor(() => expect(fapi.signUp.preparations).toEqual(['phone_code:whatsapp', 'phone_code:sms']));
    await waitFor(() => expect(screen.queryByText('Incorrect code')).toBeNull());
    expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveValue('');
  });

  it('returns to the main form when the phone number is edited from the WhatsApp code screen', async () => {
    const { user } = await renderSignUp({ environment: phoneEnvironment() });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());
    await codeSent();
    await user.click(screen.getByRole('button', { name: 'Edit phone number' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /with WhatsApp/ })).toBeNull();
  });
});

describe('resending the phone code', () => {
  it('resends the phone code over WhatsApp from the WhatsApp code screen', async () => {
    const { fapi, user } = await renderSignUp({ environment: phoneEnvironment() });
    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());
    await codeSent();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
      await user.keyboard('12');
      await act(() => vi.advanceTimersByTimeAsync(30_000));
      await user.click(await screen.findByRole('button', { name: 'Resend' }));

      await waitFor(() => expect(fapi.signUp.preparations).toEqual(['phone_code:whatsapp', 'phone_code:whatsapp']));
      expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveValue('');
      expect(screen.getByRole('heading', { name: 'Verify your WhatsApp' })).toBeInTheDocument();
      await codeSent();
    } finally {
      vi.useRealTimers();
    }
  });

  it('resends the phone code by SMS after switching to SMS from the WhatsApp code screen', async () => {
    const { fapi, user } = await renderSignUp({ environment: phoneEnvironment() });
    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());
    await codeSent();
    await user.click(screen.getByRole('button', { name: 'Send code via SMS instead' }));
    expect(await screen.findByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument();
    await codeSent();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      await act(() => vi.advanceTimersByTimeAsync(30_000));
      await user.click(await screen.findByRole('button', { name: 'Resend' }));

      await waitFor(() =>
        expect(fapi.signUp.preparations).toEqual(['phone_code:whatsapp', 'phone_code:sms', 'phone_code:sms']),
      );
      expect(screen.getByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument();
      await codeSent();
    } finally {
      vi.useRealTimers();
    }
  });

  it('starts the resend countdown after a code fails to send', async () => {
    const { user } = await renderSignUp({ environment: phoneEnvironment() });
    const hold = holdRequests('post', '/v1/client/sign_ups/:id/prepare_verification');

    await user.type(await screen.findByRole('textbox', { name: 'Phone number' }), '5555550123');
    await user.click(continueButton());
    await waitFor(() => expect(hold.requests).toHaveLength(1));
    hold.fail('verification_code_too_many_requests', 'Too many requests. Please wait before trying again.');

    expect(await screen.findByText('Too many requests. Please wait before trying again.')).toBeInTheDocument();
    await codeSent();
  });
});

describe('when the phone number or the WhatsApp send is rejected', () => {
  it('leaves a field or global phone error behind when moving between the form and the WhatsApp phone screen', async () => {
    const { fapi, user } = await renderSignUp({ environment: phoneEnvironment() });
    const onForm = holdRequests('post', '/v1/client/sign_ups');

    await user.type(await screen.findByRole('textbox', { name: 'Phone number' }), '5555550123');
    await user.click(continueButton());
    await waitFor(() => expect(onForm.requests).toHaveLength(1));
    onForm.fail('form_identifier_exists', 'That phone number is taken. Please try another.', 'phone_number');
    await screen.findByText('That phone number is taken. Please try another.');
    await user.click(screen.getByRole('button', { name: /WhatsApp/ }));

    expect(await screen.findByRole('heading', { name: /with WhatsApp/ })).toBeInTheDocument();
    expect(screen.queryByText('That phone number is taken. Please try another.')).toBeNull();

    const rejected = holdRequests('post', '/v1/client/sign_ups');
    await user.click(continueButton());
    await waitFor(() => expect(rejected.requests).toHaveLength(1));
    rejected.fail('form_identifier_exists', 'That phone number is taken. Please try another.', 'phone_number');

    expect(await screen.findByText('That phone number is taken. Please try another.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /with WhatsApp/ })).toBeInTheDocument();
    expect(fapi.signUp.preparations).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Use another method' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.queryByText('That phone number is taken. Please try another.')).toBeNull();

    const limited = holdRequests('post', '/v1/client/sign_ups');
    await user.click(screen.getByRole('button', { name: /WhatsApp/ }));
    await screen.findByRole('heading', { name: /with WhatsApp/ });
    await user.click(continueButton());
    await waitFor(() => expect(limited.requests).toHaveLength(1));
    limited.fail('too_many_requests', 'Too many requests. Please try again later.');

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Too many requests. Please try again later.'),
    );
    await user.click(screen.getByRole('button', { name: 'Use another method' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Too many requests. Please try again later.')).toBeNull());
  });

  it('replaces the WhatsApp phone screen with the blocked notice when the request is blocked', async () => {
    const { user } = await renderSignUp({
      environment: phoneEnvironment(),
      signUp: { blocked: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' } },
    });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Request blocked' })).toBeInTheDocument();
    expect(screen.getByText('Contact support.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /with WhatsApp/ })).toBeNull();
  });

  it('keeps the WhatsApp screen and its error after a failed send, then sends the code on retry', async () => {
    const { fapi, user } = await renderSignUp({
      environment: phoneEnvironment(),
      signUp: { whatsAppEnabled: false },
    });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());

    expect(await screen.findByText("The 'whatsapp' channel is not available for this instance.")).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /with WhatsApp/ })).toBeInTheDocument();
    expect(fapi.client.sign_up).toMatchObject({ id: 'sua_1', phone_number: '+15555550123' });
    fapi.signUp.whatsAppEnabled = true;
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verify your WhatsApp' })).toBeInTheDocument();
    await codeSent();
    expect(fapi.signUp.preparations).toEqual(['phone_code:whatsapp']);
  });

  it('signs up over SMS from the form after a failed WhatsApp send left a sign-up', async () => {
    const { fapi, user } = await renderSignUp({
      environment: phoneEnvironment(),
      signUp: { whatsAppEnabled: false },
    });

    await user.click(await screen.findByRole('button', { name: /WhatsApp/ }));
    await user.type(await screen.findByRole('textbox', { name: 'WhatsApp phone number' }), '5555550123');
    await user.click(continueButton());
    await screen.findByText("The 'whatsapp' channel is not available for this instance.");
    await user.click(screen.getByRole('button', { name: 'Use another method' }));

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    await user.clear(screen.getByRole('textbox', { name: 'Phone number' }));
    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '5555550123');
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument();
    await codeSent();
    expect(fapi.signUp.preparations).toEqual(['phone_code:sms']);
  });
});
