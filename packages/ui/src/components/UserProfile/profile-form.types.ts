import type { FormEvent } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';
import type { FormControlState } from '@/ui/utils/useFormControl';

export type ProfileFormProps = FormProps;

export type ProfileAvatarData = {
  firstName: string;
  lastName: string;
  imageUrl: string;
};

export type ProfileFormReadyData = {
  status: 'ready';
  scopeKey: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  showFirstName: boolean;
  showLastName: boolean;
  firstNameRequired: boolean;
  lastNameRequired: boolean;
  nameEditDisabled: boolean;
  canRemoveAvatar: boolean;
  updateName: (firstName: string, lastName: string) => Promise<void>;
  setProfileImage: (file: File | null) => Promise<void>;
  complete: () => Promise<void>;
  onReset: () => void;
};

export type ProfileFormData = { status: 'hidden' } | ProfileFormReadyData;

export type ProfileFormViewProps = {
  firstNameField: Pick<FormControlState<'firstName'>, 'id' | 'props'>;
  lastNameField: Pick<FormControlState<'lastName'>, 'id' | 'props'>;
  avatar: ProfileAvatarData;
  showFirstName: boolean;
  showLastName: boolean;
  nameEditDisabled: boolean;
  canRemoveAvatar: boolean;
  isSubmitDisabled: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  onReset: () => void;
};
