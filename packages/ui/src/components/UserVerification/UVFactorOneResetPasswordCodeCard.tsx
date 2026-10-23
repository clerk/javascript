import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useSession } from '@clerk/shared/react';
import type { ResetPasswordEmailCodeFactor, ResetPasswordPhoneCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorOneCodeCard } from './UVFactorOneCodeForm';
import { UVFactorOneCodeForm } from './UVFactorOneCodeForm';

type UVFactorOneResetPasswordCodeCardProps = UVFactorOneCodeCard & {
  factor: ResetPasswordEmailCodeFactor | ResetPasswordPhoneCodeFactor;
  newPassword: string;
  signOutOfOtherSessions: boolean;
  /** The caller collected the new password, so the copy says it's being saved, not reset. */
  hasNewPassword: boolean;
  /** The code was right but the new password was rejected; the code stays usable. */
  onNewPasswordRejected: (err: Error) => void;
};

/**
 * Verifies with a reset password code. The attempt carries the new password,
 * which replaces the current one once the verification completes.
 */
export const UVFactorOneResetPasswordCodeCard = (props: UVFactorOneResetPasswordCodeCardProps) => {
  const { newPassword, signOutOfOtherSessions, hasNewPassword, onNewPasswordRejected, ...codeCardProps } = props;
  const { session } = useSession();
  const isEmail = props.factor.strategy === 'reset_password_email_code';
  const channel = isEmail ? 'email' : 'phone';

  return (
    <Flow.Part part='resetPassword'>
      <UVFactorOneCodeForm
        {...codeCardProps}
        cardTitle={localizationKeys(
          hasNewPassword
            ? `reverification.resetPasswordCode.title__saveNewPassword_${channel}`
            : 'reverification.resetPasswordCode.title',
        )}
        cardSubtitle={localizationKeys(
          hasNewPassword
            ? `reverification.resetPasswordCode.subtitle__saveNewPassword_${channel}`
            : `reverification.resetPasswordCode.subtitle_${channel}`,
        )}
        inputLabel={localizationKeys('reverification.resetPasswordCode.formTitle')}
        resendButton={localizationKeys('reverification.resetPasswordCode.resendButton')}
        identityPreviewEditButtonAriaLabel={localizationKeys(
          isEmail ? 'identityPreviewEditButton__emailAddress' : 'identityPreviewEditButton__phoneNumber',
        )}
        attempt={code =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          session!.attemptFirstFactorVerification({
            strategy: props.factor.strategy,
            code,
            password: newPassword,
            signOutOfOtherSessions,
          })
        }
        onAttemptError={(err, reject) => {
          if (isClerkAPIResponseError(err) && err.errors[0]?.meta?.paramName === 'password') {
            onNewPasswordRejected(err);
            return;
          }
          void reject(err);
        }}
      />
    </Flow.Part>
  );
};
