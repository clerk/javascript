import * as stylex from '@stylexjs/stylex';

import { rich } from '../../localization';
import { tabularNumbersStyle } from '../../styles/typography.styles';
import type { VerificationCodeResend } from './verification-code';

export interface VerificationResendMessages {
  resendText: string;
  resend: string;
  resendCountdown: string;
}

interface VerificationResendOptions {
  onResend?: () => void;
  canResend: boolean;
  remainingSeconds?: number;
}

export function verificationResend(
  messages: VerificationResendMessages,
  { onResend, canResend, remainingSeconds }: VerificationResendOptions,
): VerificationCodeResend | undefined {
  if (!onResend) {
    return undefined;
  }
  return {
    text: messages.resendText,
    label: remainingSeconds ? (
      <span>
        {rich(messages.resendCountdown, {
          values: {
            seconds: <span {...stylex.props(tabularNumbersStyle.enabled)}>{remainingSeconds}</span>,
          },
        })}
      </span>
    ) : (
      messages.resend
    ),
    disabled: !canResend,
    onClick: onResend,
  };
}
