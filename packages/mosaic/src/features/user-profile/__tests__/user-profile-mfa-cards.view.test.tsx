import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { Flow } from '../../../components/flow';
import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileAddAuthenticatorView } from '../user-profile-add-authenticator.view';
import { UserProfileAddSmsView } from '../user-profile-add-sms.view';
import { UserProfileBackupCodesView } from '../user-profile-backup-codes.view';

describe('MFA cards', () => {
  it.each(['select', 'phone'] as const)('focuses the %s field when entering SMS from another card', async step => {
    function Example() {
      const [active, setActive] = useState('start');
      return (
        <MosaicProvider>
          <Card.Root renderBranding={false}>
            <Flow.Root
              value={active}
              state={null}
            >
              {() => (
                <>
                  <Flow.Step ids={['start']}>
                    <button
                      type='button'
                      onClick={() => setActive('sms')}
                    >
                      Start SMS
                    </button>
                  </Flow.Step>
                  <Flow.Step ids={['sms']}>
                    <UserProfileAddSmsView
                      step={step}
                      phoneNumbers={[{ id: 'phone', phoneNumber: '+18015550100' }]}
                      selectedPhoneId='phone'
                      onSelectedPhoneIdChange={vi.fn()}
                      onAddPhone={vi.fn()}
                      onBack={vi.fn()}
                      phoneNumber=''
                      onPhoneNumberChange={vi.fn()}
                      code=''
                      onCodeChange={vi.fn()}
                      onSubmit={vi.fn()}
                      onResend={vi.fn()}
                      onCancel={vi.fn()}
                    />
                  </Flow.Step>
                </>
              )}
            </Flow.Root>
          </Card.Root>
        </MosaicProvider>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Start SMS' }));
    await waitFor(() => {
      expect(screen.getByRole(step === 'select' ? 'combobox' : 'textbox', { name: /Phone/ })).toHaveFocus();
    });
  });

  it('saves backup codes on a card and supports cancelling a failed generation', async () => {
    const user = userEvent.setup();
    const props = { codes: ['demo-code'], onCopy: vi.fn(), onDownload: vi.fn(), onRetry: vi.fn(), onCancel: vi.fn() };
    const { rerender } = render(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <UserProfileBackupCodesView {...props} />
        </Card.Root>
      </MosaicProvider>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Download', exact: true }));
    expect(props.onDownload).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Copy and close', exact: true }));
    expect(props.onCopy).toHaveBeenCalledOnce();
    rerender(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <UserProfileBackupCodesView
            {...props}
            codes={[]}
            errorMessage='Unable to generate codes.'
          />
        </Card.Root>
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Try again', exact: true }));
    expect(props.onRetry).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
    expect(props.onCancel).toHaveBeenCalledOnce();
  });

  it('renders authenticator setup on a card and delegates verification and cancellation', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <UserProfileAddAuthenticatorView
            setup={{ secret: 'demo-secret', uri: 'otpauth://totp/demo?secret=demo-secret' }}
            code='123456'
            onCodeChange={vi.fn()}
            onSubmit={onSubmit}
            onRetry={vi.fn()}
            onCancel={onCancel}
          />
        </Card.Root>
      </MosaicProvider>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Verify', exact: true }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('123456');
    await user.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders SMS selection without a dialog and delegates cancellation', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(
      <MosaicProvider>
        <Card.Root renderBranding={false}>
          <UserProfileAddSmsView
            step='select'
            phoneNumbers={[{ id: 'phone', phoneNumber: '+18015550100' }]}
            selectedPhoneId='phone'
            onSelectedPhoneIdChange={vi.fn()}
            onAddPhone={vi.fn()}
            onBack={vi.fn()}
            phoneNumber=''
            onPhoneNumberChange={vi.fn()}
            code=''
            onCodeChange={vi.fn()}
            onSubmit={onSubmit}
            onResend={vi.fn()}
            onCancel={onCancel}
          />
        </Card.Root>
      </MosaicProvider>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue', exact: true }));
    expect(onSubmit).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
