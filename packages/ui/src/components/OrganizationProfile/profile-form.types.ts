import type { ChangeEvent, FormEvent } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';
import type { FormControlState } from '@/ui/utils/useFormControl';

export type OrganizationProfileFormProps = FormProps;

export type OrganizationProfileAvatarData = {
  name: string;
  imageUrl: string;
};

export type OrganizationProfileUpdateData = {
  name: string;
  slug?: string;
};

export type OrganizationProfileFormReadyData = {
  status: 'ready';
  scopeKey: string;
  name: string;
  slug: string | null | undefined;
  initialSlug: string;
  avatar: OrganizationProfileAvatarData;
  canRemoveAvatar: boolean;
  slugEnabled: boolean;
  update: (params: OrganizationProfileUpdateData) => Promise<void>;
  setLogo: (file: File | null) => Promise<void>;
  complete: () => Promise<void>;
  onReset: () => void;
};

export type OrganizationProfileFormData = { status: 'hidden' } | OrganizationProfileFormReadyData;

export type OrganizationProfileFormViewProps = {
  nameField: Pick<FormControlState<'name'>, 'id' | 'props'>;
  slugField: Pick<FormControlState<'slug'>, 'id' | 'props'>;
  canSubmit: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  onChangeSlug: (event: ChangeEvent<HTMLInputElement>) => void;
  avatar: OrganizationProfileAvatarData;
  canRemoveAvatar: boolean;
  slugEnabled: boolean;
  onReset: () => void;
};
