import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileAddAuthenticatorView } from '../user-profile-add-authenticator.view';
import { UserProfileAddMfaView } from '../user-profile-add-mfa.view';

describe('MFA selection', () => {
  it('continues into setup within the same dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Example() {
      const [step, setStep] = useState('select');
      return (
        <MosaicProvider>
          <Dialog.Root
            open
            onOpenChange={onOpenChange}
          >
            <Dialog.Popup variant='card'>
              <Card.Root renderBranding={false}>
                <Flow.Root
                  value={step}
                  state={null}
                >
                  {() => (
                    <>
                      <Flow.Step ids={['select']}>
                        <UserProfileAddMfaView
                          methods={['authenticator']}
                          onSelect={setStep}
                        />
                      </Flow.Step>
                      <Flow.Step ids={['authenticator']}>
                        <UserProfileAddAuthenticatorView
                          setup={{ secret: 'demo-secret', uri: 'otpauth://totp/demo?secret=demo-secret' }}
                          code=''
                          onCodeChange={vi.fn()}
                          onSubmit={vi.fn()}
                          onRetry={vi.fn()}
                          onCancel={vi.fn()}
                        />
                      </Flow.Step>
                    </>
                  )}
                </Flow.Root>
              </Card.Root>
            </Dialog.Popup>
          </Dialog.Root>
        </MosaicProvider>
      );
    }
    render(<Example />);
    const dialog = screen.getByRole('dialog', { name: 'Add 2-step verification' });
    expect(within(dialog).queryByRole('button', { name: /SMS verification/ })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Add an authenticator app' })).toBe(dialog));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
  });
});
