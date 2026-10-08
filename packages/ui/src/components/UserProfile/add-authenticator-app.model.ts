import type { TOTPResource } from '@clerk/shared/types';
import type { MutableRefObject } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '@/ui/localization';

import { useMfaTotpModel } from './mfa-totp.model';

export type AddAuthenticatorAppProps = FormProps & {
  title: LocalizationKey;
  pendingTotpRef: MutableRefObject<TOTPResource | undefined>;
};

export const useAddAuthenticatorAppModel = ({ pendingTotpRef }: AddAuthenticatorAppProps) =>
  useMfaTotpModel({ pendingTotpRef });
