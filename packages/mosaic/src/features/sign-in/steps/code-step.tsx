import type { Ref } from 'react';

import type { VerificationCodeMessages, VerificationCodeResend } from '../../../blocks/verification';
import { VerificationCode } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { SignInIdentityPreview } from './sign-in-identity-preview';

interface CodeStepProps {
  messages: VerificationCodeMessages;
  resend?: VerificationCodeResend;
  identity: { identifier?: string; editLabel: string };
  notice?: string;
  onEditIdentifier: () => void;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onCodeComplete: (code: string) => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function CodeStep({
  messages,
  resend,
  identity,
  notice,
  onEditIdentifier,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  onSubmit,
  onCodeComplete,
  onCancel,
  focusRef,
}: CodeStepProps) {
  const { value, onValueChange } = form.registerValue('code');

  return (
    <VerificationCode
      focusRef={focusRef}
      messages={messages}
      value={value}
      errorMessage={errorMessage}
      globalErrorMessage={globalErrorMessage}
      isPending={isPending}
      resend={resend}
      identityPreview={
        identity.identifier ? (
          <SignInIdentityPreview
            identifier={identity.identifier}
            editLabel={identity.editLabel}
            disabled={isPending}
            onEdit={onEditIdentifier}
          />
        ) : undefined
      }
      notice={notice}
      onValueChange={onValueChange}
      onComplete={onCodeComplete}
      onSubmit={() => onSubmit()}
      onCancel={onCancel}
    />
  );
}
