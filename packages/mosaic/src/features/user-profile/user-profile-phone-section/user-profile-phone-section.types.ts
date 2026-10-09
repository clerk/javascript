import type { CountryIso } from '../../../components/phone-input';
import type { UserProfilePhone, UserProfilePhoneVerifier } from '../user-profile-contact.types';
import type { UserProfileAddPhoneController } from './user-profile-add-phone.controller';

export interface UserProfilePhoneSectionViewProps {
  phones: UserProfilePhone[];
  defaultPhoneCountry?: CountryIso;
  canAdd: boolean;
  verification: UserProfileAddPhoneController;
  error: string | undefined;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onRemove?: (id: string) => Promise<void>;
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
    };

export type ReadyPhoneSectionModel = Extract<UserProfilePhoneSectionModel, { status: 'ready' }>;
