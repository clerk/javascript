import type { TOTPResource } from '@clerk/shared/types';
import type { MutableRefObject } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';

import { useMfaTotpModel } from './mfa-totp.model';

export type VerifyTOTPProps = FormProps & {
  verifiedTotpRef: MutableRefObject<TOTPResource | undefined>;
  onBack: () => void;
};

export const useVerifyTOTPModel = ({ verifiedTotpRef }: VerifyTOTPProps) => useMfaTotpModel({ verifiedTotpRef });
