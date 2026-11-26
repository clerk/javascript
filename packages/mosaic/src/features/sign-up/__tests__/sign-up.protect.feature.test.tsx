import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSignUp } from '../../../__tests__/feature/fapi';
import {
  codeSent,
  continueButton,
  EMAIL,
  environment,
  renderSignUp,
  renderSignUpWithRouteProbe,
  submitStart,
} from './sign-up.fixtures';

function completedByProtectCheck(): FakeFapiSeed {
  return {
    environment: environment({ attributes: { email_address: { required: true, verify_at_sign_up: false } } }),
    signUp: { protectChecks: 1 },
  };
}

describe('passing the Protect check', () => {
  it('runs the protect check before verifying the email', async () => {
    const { fapi, user } = await renderSignUp({ signUp: { protectChecks: 1 } });

    await submitStart(user);

    expect(await screen.findByRole('heading', { name: 'Verifying your request' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
    await codeSent();
  });

  it('runs a second protect check when Clerk issues another', async () => {
    const { fapi, user } = await renderSignUp({ signUp: { protectChecks: 2 } });

    await submitStart(user);
    const firstChallenge = await screen.findByRole('button', { name: 'I am human' });
    await user.click(firstChallenge);
    await waitFor(() => expect(firstChallenge).not.toBeInTheDocument());
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1', 'proof_ptk_2']);
    await codeSent();
  });

  it('runs the replacement Protect check Clerk issues for a rejected proof', async () => {
    const { fapi, user } = await renderSignUp({
      signUp: {
        protectChecks: 1,
        protectCheckScript: `
export default (container, { token }) =>
  new Promise(resolve => {
    const pass = document.createElement('button');
    pass.type = 'button';
    pass.textContent = 'I am human';
    pass.onclick = () => resolve(token === 'ptk_1' ? 'proof_rejected' : 'proof_' + token);
    container.replaceChildren(pass);
  });
`,
      },
    });

    await submitStart(user);
    const firstChallenge = await screen.findByRole('button', { name: 'I am human' });
    await user.click(firstChallenge);
    await waitFor(() => expect(firstChallenge).not.toBeInTheDocument());
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.proofTokens).toEqual(['proof_rejected', 'proof_ptk_2']);
    await codeSent();
  });

  it('continues with the sign-up the 404 returns when the Protect check was resolved elsewhere', async () => {
    const { user } = await renderSignUp({ signUp: { protectChecks: 1, protectCheckResolvedElsewhere: true } });

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    await codeSent();
    expect(screen.getByRole('alert')).toHaveTextContent(/^$/);
  });

  it('keeps the continue screen as the place to edit after a Protect check raised on it', async () => {
    const { fapi, user } = await renderSignUpWithRouteProbe({
      environment: environment({
        attributes: { email_address: { required: false }, phone_number: { enabled: true, required: false } },
      }),
      client: { ...fapiClient(), sign_up: fapiSignUp({ has_password: true }) },
      signUp: { protectChecks: 1, protectCheckOn: 'update' },
    });
    await user.click(screen.getByRole('button', { name: 'Open the continue route' }));
    await user.type(await screen.findByRole('textbox', { name: 'Email address' }), EMAIL);
    await user.click(continueButton());

    expect(await screen.findByRole('heading', { name: 'Verifying your request' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    await codeSent();
    await user.click(screen.getByRole('button', { name: 'Edit email address' }));

    expect(await screen.findByRole('heading', { name: 'Fill in missing fields' })).toBeInTheDocument();
    expect(fapi.signUp.creations).toHaveLength(0);
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
  });
});

describe('failing the Protect check', () => {
  it('shows a failed protect check and runs it again on Try again', async () => {
    const { fapi, user } = await renderSignUp({ signUp: { protectChecks: 1 } });

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'Fail the challenge' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent("Verification didn't complete. Please try again."),
    );
    expect(fapi.signUp.proofTokens).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
    await codeSent();
  });

  it('clears the failed widget before Try again runs the Protect check again', async () => {
    const { fapi, user } = await renderSignUp({
      signUp: {
        protectChecks: 1,
        protectCheckScript: `
export default (container, { token, setWidgetVisible }) =>
  new Promise((resolve, reject) => {
    const pass = document.createElement('button');
    pass.type = 'button';
    pass.textContent = 'I am human';
    pass.onclick = () => resolve('proof_' + token);
    const fail = document.createElement('button');
    fail.type = 'button';
    fail.textContent = 'Fail the challenge';
    fail.onclick = () => reject(new Error('challenge failed'));
    container.append(pass, fail);
    void setWidgetVisible?.(true);
  });
`,
      },
    });

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'Fail the challenge' }));
    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(screen.getAllByRole('button', { name: 'I am human' })).toHaveLength(1));
    expect(screen.getAllByRole('button', { name: 'Fail the challenge' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'I am human' }));
    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
    await codeSent();
  });

  it('shows the loading spinner on Try again when the failed widget left itself shown', async () => {
    const { user } = await renderSignUp({
      signUp: {
        protectChecks: 1,
        protectCheckScript: `
let runs = 0;
export default (container, { setWidgetVisible }) => {
  runs += 1;
  if (runs > 1) {
    return new Promise(() => {});
  }
  return new Promise((_, reject) => {
    const fail = document.createElement('button');
    fail.type = 'button';
    fail.textContent = 'Fail the challenge';
    fail.onclick = () => reject(new Error('challenge failed'));
    container.append(fail);
    void setWidgetVisible?.(true);
  });
};
`,
      },
    });

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'Fail the challenge' }));
    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('progressbar', { name: 'Loading…' })).toBeInTheDocument();
  });

  it('shows the timeout when a reload returns the Protect check expired, and reloads again on each Try again', async () => {
    const { fapi, user } = await renderSignUp({ signUp: { protectChecks: 1, protectCheckExpired: true } });
    const timedOut = () =>
      waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent("Verification didn't complete in time. Please try again."),
      );

    await submitStart(user);
    await timedOut();
    expect(fapi.signUp.reloads).toBe(1);
    expect(fapi.signUp.proofTokens).toEqual([]);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
    expect(screen.queryByRole('progressbar', { name: 'Loading…' })).toBeNull();
    for (const reloads of [2, 3]) {
      await user.click(screen.getByRole('button', { name: 'Try again' }));
      await waitFor(() => expect(fapi.signUp.reloads).toBe(reloads));
      await timedOut();
    }
  });

  it('replaces the Protect check with the blocked notice when the proof is blocked', async () => {
    const { user } = await renderSignUp({
      signUp: {
        protectChecks: 1,
        protectCheckBlocked: { trace_id: 'trace_123', title: 'Request blocked', description: 'Contact support.' },
      },
    });

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    expect(await screen.findByRole('heading', { name: 'Request blocked' })).toBeInTheDocument();
    expect(screen.getByText('Contact support.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});

describe('finishing the sign-up from the Protect check', () => {
  it('stays busy on the Protect check while the new session is activated', async () => {
    const { user } = await renderSignUp(completedByProtectCheck());
    const hold = holdRequests('post', '/v1/client/sessions/:id/touch');

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'I am human' }));
    await waitFor(() => expect(hold.requests).toHaveLength(1));

    expect(await screen.findByRole('progressbar', { name: 'Loading…' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Verifying your request' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    hold.release();
  });

  it('shows why the new session could not be activated and activates it on Try again', async () => {
    const seed = completedByProtectCheck();
    const { fapi, user, navigate, container } = await renderSignUp(seed);
    const hold = holdRequests('post', '/v1/client/sessions/:id/touch');

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'I am human' }));
    await waitFor(() => expect(hold.requests).toHaveLength(1));
    hold.fail('form_param_invalid', 'The session could not be activated.');

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('The session could not be activated.'));
    expect(screen.getByRole('heading', { name: 'Verifying your request' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar', { name: 'Loading…' })).toBeNull();
    expect(navigate).not.toHaveBeenCalled();

    const retry = serveFapi({ ...seed, client: fapi.client });
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(retry.signUp.proofTokens).toEqual([]);
  });

  it('leaves once when the Protect check completes the sign-up', async () => {
    const { fapi, user, navigate, container } = await renderSignUp(completedByProtectCheck());

    await submitStart(user);
    await user.click(await screen.findByRole('button', { name: 'I am human' }));

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(fapi.signUp.proofTokens).toEqual(['proof_ptk_1']);
  });
});
