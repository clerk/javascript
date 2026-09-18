import { useRef } from 'react';

import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { EnterPhoneStep, VerifyPhoneStep } from '../user-profile-phone.steps';

export interface UserProfileAddPhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  step: 'phone' | 'verify';
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  resendSeconds?: number;
}

export function UserProfileAddPhoneDialog(props: UserProfileAddPhoneDialogProps) {
  const phoneRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      {props.trigger ? <Dialog.Trigger render={props.trigger} /> : null}
      <Dialog.Popup
        variant='card'
        initialFocus={props.step === 'phone' ? phoneRef : undefined}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Flow.Root
            value={props.step}
            state={props}
          >
            {current => (
              <>
                <Flow.Step ids={['phone']}>
                  <EnterPhoneStep
                    inputRef={phoneRef}
                    phoneNumber={current.phoneNumber}
                    onPhoneNumberChange={current.onPhoneNumberChange}
                    onSubmit={current.onSubmit}
                    isPending={current.isPending}
                    errorMessage={current.errorMessage}
                  />
                </Flow.Step>
                <Flow.Step ids={['verify']}>
                  <VerifyPhoneStep
                    phoneNumber={current.phoneNumber}
                    code={current.code}
                    onCodeChange={current.onCodeChange}
                    onSubmit={current.onSubmit}
                    onResend={current.onResend}
                    isPending={current.isPending}
                    errorMessage={current.errorMessage}
                    isResending={current.isResending}
                    resendSeconds={current.resendSeconds}
                  />
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
