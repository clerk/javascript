import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, renderHook } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useMfaFormController } from '../mfa-form.controller';
import { useMfaFormModel } from '../mfa-form.model';
import { MfaForm } from '../MfaForm';

vi.mock('../MfaTOTPScreen', () => ({
  MfaTOTPScreen: ({ onSuccess, onReset }: { onSuccess: () => void; onReset: () => void }) => (
    <div>
      Authenticator setup
      <button
        type='button'
        onClick={onSuccess}
      >
        Finish setup
      </button>
      <button
        type='button'
        onClick={onReset}
      >
        Cancel setup
      </button>
    </div>
  ),
}));
vi.mock('../MfaPhoneCodeScreen', () => ({ MfaPhoneCodeScreen: () => <div>Phone setup</div> }));
vi.mock('../MfaBackupCodeScreen', () => ({ MfaBackupCodeScreen: () => <div>Backup setup</div> }));

const { createFixtures } = bindCreateFixtures('UserProfile');
const callbacks = () => ({ onSuccess: vi.fn(), onReset: vi.fn() });
const setup = async (totpEnabled = false) => {
  const fixturesResult = await createFixtures(f => {
    f.withAuthenticatorApp();
    f.withUser({ two_factor_enabled: true, totp_enabled: totpEnabled });
  });
  const { fixtures } = fixturesResult;
  const initial = fixtures.clerk.user!;
  const source = vi.spyOn(fixtures.clerk, 'user', 'get');
  const replaceUser = (user: typeof initial | null) => {
    source.mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user,
    };
  };
  return { ...fixturesResult, initial, replaceUser };
};

describe('MFA form resource boundary', () => {
  it('projects available methods without exposing user or environment resources', async () => {
    const { wrapper, initial } = await setup();
    const { result } = renderHook(useMfaFormModel, { wrapper });
    expect(result.current).toEqual({ status: 'ready', userId: initial.id, methods: ['totp'] });
  });

  it('does not expose a form until a user is available', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withAuthenticatorApp();
    });
    const { result } = renderHook(useMfaFormModel, { wrapper });
    expect(result.current).toEqual({ status: 'unavailable' });
  });

  it('projects current enrollment while the controller retains its initial method list', async () => {
    const { wrapper: Fixture, initial, replaceUser } = await setup();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <CardStateProvider>{children}</CardStateProvider>
      </Fixture>
    );
    const props = callbacks();
    const { result, rerender } = renderHook(
      () => {
        const model = useMfaFormModel();
        const controller = useMfaFormController(model.status === 'ready' ? model.methods : [], props);
        return { model, controller };
      },
      { wrapper },
    );
    replaceUser({ ...initial, totpEnabled: true });
    rerender();
    expect(result.current.model).toEqual({ status: 'ready', userId: initial.id, methods: [] });
    expect(result.current.controller.method).toBe('totp');
    expect(result.current.controller.hasError).toBe(false);
  });

  it('keeps an active setup screen when enrollment updates for the same user', async () => {
    const { wrapper, initial, replaceUser } = await setup();
    const props = callbacks();
    const { getByText, rerender } = render(<MfaForm {...props} />, { wrapper });
    expect(getByText('Authenticator setup')).toBeInTheDocument();
    replaceUser({ ...initial, totpEnabled: true });
    rerender(<MfaForm {...props} />);
    expect(getByText('Authenticator setup')).toBeInTheDocument();
  });

  it('starts a new form for a different user and clears the previous form error', async () => {
    const { wrapper, initial, replaceUser } = await setup(true);
    const props = callbacks();
    const { getByText, queryByText, rerender } = render(<MfaForm {...props} />, { wrapper });
    expect(getByText('There are no second factors available to add')).toBeInTheDocument();
    replaceUser({ ...initial, id: 'user_2', totpEnabled: false });
    rerender(<MfaForm {...props} />);
    expect(getByText('Authenticator setup')).toBeInTheDocument();
    expect(queryByText('There are no second factors available to add')).not.toBeInTheDocument();
  });

  it('does not keep the previous user method when the new user has no available methods', async () => {
    const { wrapper, initial, replaceUser } = await setup();
    const props = callbacks();
    const { getByText, queryByText, rerender } = render(<MfaForm {...props} />, { wrapper });
    expect(getByText('Authenticator setup')).toBeInTheDocument();
    replaceUser({ ...initial, id: 'user_2', totpEnabled: true });
    rerender(<MfaForm {...props} />);
    expect(queryByText('Authenticator setup')).not.toBeInTheDocument();
    expect(getByText('There are no second factors available to add')).toBeInTheDocument();
  });

  it('removes the setup screen when the user is unavailable and starts fresh when the user returns', async () => {
    const { wrapper, initial, replaceUser } = await setup();
    const props = callbacks();
    const { queryByText, getByText, rerender } = render(<MfaForm {...props} />, { wrapper });
    replaceUser(null);
    rerender(<MfaForm {...props} />);
    expect(queryByText('Authenticator setup')).not.toBeInTheDocument();
    replaceUser({ ...initial, totpEnabled: true });
    rerender(<MfaForm {...props} />);
    expect(queryByText('Authenticator setup')).not.toBeInTheDocument();
    expect(getByText('There are no second factors available to add')).toBeInTheDocument();
  });

  it('uses an explicit method and preserves completion and reset callbacks', async () => {
    const { wrapper } = await setup();
    const props = callbacks();
    const { getByText, getByRole, rerender, userEvent } = render(
      <MfaForm
        {...props}
        selectedStrategy='phone_code'
      />,
      { wrapper },
    );
    expect(getByText('Phone setup')).toBeInTheDocument();
    rerender(
      <MfaForm
        {...props}
        selectedStrategy='totp'
      />,
    );
    await userEvent.click(getByRole('button', { name: 'Finish setup' }));
    await userEvent.click(getByRole('button', { name: 'Cancel setup' }));
    expect(props.onSuccess).toHaveBeenCalledTimes(1);
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });
});
