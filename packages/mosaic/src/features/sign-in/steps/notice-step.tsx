import type { VerificationHelpMessages } from '../../../blocks/verification';
import { VerificationHelp } from '../../../blocks/verification';
import type { SignInStep } from '../sign-in.types';

interface NoticeStepProps {
  step: Extract<SignInStep, { kind: 'notice' }>;
  messages: { help: VerificationHelpMessages };
  onEmailSupport: () => void;
  onBack: () => void;
}

export function NoticeStep({ step, messages, onEmailSupport, onBack }: NoticeStepProps) {
  switch (step.purpose) {
    case 'help':
      return (
        <VerificationHelp
          messages={messages.help}
          onEmailSupport={onEmailSupport}
          onBack={onBack}
        />
      );
  }
}
