import type { Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import type { CountryIso } from '../../../components/phone-input';
import type { ReverificationController } from '../../reverification';
import type { UserProfilePhone, UserProfilePhoneVerifier } from '../user-profile-contact.types';
import type { UserProfileAddPhoneController } from './user-profile-add-phone.controller';

export interface UserProfilePhoneSectionViewProps {
  phones: UserProfilePhone[];
  defaultPhoneCountry?: CountryIso;
  canAdd: boolean;
  verification: UserProfileAddPhoneController;
  error: string | undefined;
  rowRef: Ref<HTMLDivElement>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<UserProfilePhone>;
  finalFocus: DialogFocusTarget;
  verificationFinalFocus: DialogFocusTarget;
  setPrimaryReverification: ReverificationController;
  setPrimaryFinalFocus: DialogFocusTarget;
  pendingVerifyId?: string;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

export type UserProfilePhoneSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      phones: UserProfilePhone[];
      defaultPhoneCountry?: CountryIso;
      onCreatePhone?: (phoneNumber: string) => Promise<UserProfilePhoneVerifier>;
      getPhoneVerifier: (id: string) => UserProfilePhoneVerifier;
      onSetPrimaryPhone: (id: string) => Promise<void>;
      onRemovePhone?: (id: string) => Promise<void>;
      removeReverification: ReverificationController;
      setPrimaryReverification: ReverificationController;
      createReverification: ReverificationController;
    };

export type ReadyPhoneSectionModel = Extract<UserProfilePhoneSectionModel, { status: 'ready' }>;
