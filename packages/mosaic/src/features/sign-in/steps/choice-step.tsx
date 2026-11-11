import type { Ref } from 'react';

import type { VerificationMethodPickerMessages } from '../../../blocks/verification';
import { VerificationMethodPicker } from '../../../blocks/verification';
import type { IconComponent } from '../../../icons/glyph';
import { Envelope } from '../../../icons/glyphs/envelope';
import { Key } from '../../../icons/glyphs/key';
import { SecurityLockSquare } from '../../../icons/glyphs/security-lock-square';
import { SecurityPasskey } from '../../../icons/glyphs/security-passkey';
import { SecurityPhone } from '../../../icons/glyphs/security-phone';
import type { SignInFactor, SignInStep } from '../sign-in.types';

const factorIcon = {
  password: SecurityLockSquare,
  passkey: SecurityPasskey,
  email_code: Envelope,
  phone_code: SecurityPhone,
  totp: SecurityLockSquare,
  backup_code: Key,
  reset_password_email_code: Envelope,
  reset_password_phone_code: SecurityPhone,
} as const satisfies Record<SignInFactor['strategy'], IconComponent>;

interface ChoiceStepProps {
  step: Extract<SignInStep, { kind: 'choice' }>;
  messages: VerificationMethodPickerMessages;
  factorLabel: (factor: SignInFactor) => string;
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  onShowHelp: () => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function ChoiceStep({
  step,
  messages,
  factorLabel,
  pendingFactorId,
  onSelectFactor,
  onShowHelp,
  onBack,
  focusRef,
}: ChoiceStepProps) {
  return (
    <VerificationMethodPicker
      focusRef={focusRef}
      messages={messages}
      methods={step.options.map(factor => ({
        id: factor.id,
        label: factorLabel(factor),
        icon: factorIcon[factor.strategy],
      }))}
      pendingMethodId={pendingFactorId}
      onSelect={onSelectFactor}
      onHelp={onShowHelp}
      onBack={onBack}
    />
  );
}
