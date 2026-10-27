import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useSession } from '@clerk/shared/react';
import type { ResetPasswordCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { UVFactorOneCodeCard } from './UVFactorOneCodeForm';
import { UVFactorOneCodeForm } from './UVFactorOneCodeForm';

type UVFactorOneResetPasswordCodeCardProps = UVFactorOneCodeCard & {
  factor: ResetPasswordCodeFactor;
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

  return (
    <Flow.Part part='resetPassword'>
      <UVFactorOneCodeForm
        {...codeCardProps}
        cardTitle={
          !hasNewPassword
            ? localizationKeys('reverification.resetPasswordCode.title')
            : isEmail
              ? localizationKeys('reverification.resetPasswordCode.title__saveNewPassword_email')
              : localizationKeys('reverification.resetPasswordCode.title__saveNewPassword_phone')
        }
        cardSubtitle={
          hasNewPassword
            ? isEmail
              ? localizationKeys('reverification.resetPasswordCode.subtitle__saveNewPassword_email')
              : localizationKeys('reverification.resetPasswordCode.subtitle__saveNewPassword_phone')
            : isEmail
              ? localizationKeys('reverification.resetPasswordCode.subtitle_email')
              : localizationKeys('reverification.resetPasswordCode.subtitle_phone')
        }
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
