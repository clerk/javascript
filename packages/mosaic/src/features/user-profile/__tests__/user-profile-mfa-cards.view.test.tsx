import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { Flow } from '../../../components/flow';
import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileAddSmsView } from '../user-profile-add-sms.view';

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
});
