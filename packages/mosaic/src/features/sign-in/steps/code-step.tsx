import type { Ref } from 'react';

import type { VerificationCodeMessages, VerificationCodeResend } from '../../../blocks/verification';
import { VerificationCode } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import { useMessages } from '../../../localization';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { SignInIdentityPreview } from './sign-in-identity-preview';

interface CodeStepProps {
  messages: VerificationCodeMessages;
  resend?: VerificationCodeResend;
  identifier?: string;
  notice?: string;
  onEditIdentifier?: () => void;
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
  identifier,
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
  const m = useMessages('signIn');
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
        identifier ? (
          <SignInIdentityPreview
            identifier={identifier}
            editLabel={m.editIdentifier}
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
