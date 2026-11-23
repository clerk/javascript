import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { FieldsConfig } from '../../../components/form';
import { useForm } from '../../../components/form';
import { MosaicProvider } from '../../../mosaic-provider';
import type { SignInStep, SignInValues, SignInViewProps } from '../sign-in.types';
import { SignInView } from '../sign-in.view';

const emptyValues: SignInValues = {
  identifier: '',
  phoneNumber: '',
  password: '',
  code: '',
  backupCode: '',
  firstName: '',
  lastName: '',
  username: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
  legalAccepted: false,
};

type ViewOverrides = Partial<Omit<SignInViewProps, 'step' | 'form'>>;

function Host({
  step,
  fields,
  onSubmit = () => Promise.resolve(),
  ...overrides
}: ViewOverrides & {
  step: SignInStep;
  fields?: FieldsConfig<SignInValues>;
  onSubmit?: (values: SignInValues) => Promise<unknown>;
}) {
  const form = useForm<SignInValues>({ initialValues: emptyValues, fields, onSubmit });
  return (
    <SignInView
      step={step}
      applicationName='Acme'
      combined={false}
      socialProviders={[]}
      onSelectProvider={vi.fn()}
      form={form}
      onSubmit={event => form.handleSubmit(event ?? { preventDefault: () => undefined })}
      onCodeComplete={vi.fn()}
      isPending={false}
      isDisabled={false}
      onEditIdentifier={vi.fn()}
      onShowHelp={vi.fn()}
      onBack={vi.fn()}
      onStartOver={vi.fn()}
      onEmailSupport={vi.fn()}
      onSelectFactor={vi.fn()}
      onSelectAccount={vi.fn()}
      canResend={false}
      {...overrides}
    />
  );
}

function renderSignIn(props: Parameters<typeof Host>[0]) {
  const view = render(
    <MosaicProvider>
      <Host {...props} />
    </MosaicProvider>,
  );
  return {
    ...view,
    user: userEvent.setup(),
    rerender: (next: Parameters<typeof Host>[0]) =>
      view.rerender(
        <MosaicProvider>
          <Host {...next} />
        </MosaicProvider>,
      ),
  };
}

describe('Starting over after a sign-in cannot continue', () => {
  const step: SignInStep = { kind: 'notice', purpose: 'start-over' };

  it('reports the failure as an alert and starts over from the button', async () => {
    const onStartOver = vi.fn();
    const { user } = renderSignIn({ step, onStartOver });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'We couldn’t continue signing you in. Start over to try again.',
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Start over' }));
    expect(onStartOver).toHaveBeenCalledTimes(1);
  });

  it('marks Start over busy while it runs, then shows why it failed', async () => {
    const { rerender } = renderSignIn({ step, isPending: true });
    expect(screen.getByRole('button', { name: /Start over/ })).toHaveAttribute('aria-busy', 'true');

    rerender({ step, globalErrorMessage: 'The network is unreachable.' });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('The network is unreachable.'));
    expect(screen.getByRole('button', { name: 'Start over' })).not.toHaveAttribute('aria-busy');
  });
});
