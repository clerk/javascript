import type { ChangeEvent, FormEvent } from 'react';

import type { LocalizationKey } from '@/ui/localization';
import type { FormControlState } from '@/ui/utils/useFormControl';

export type CreateOrganizationFormData = {
  scopeKey: string;
  canRun: () => boolean;
  isCreated: boolean;
  create: (
    input: { name: string; slug: string; file?: File | null },
    canContinue?: () => boolean,
  ) => Promise<{ skipInvitations: boolean } | null>;
  complete: (canContinue?: () => boolean) => Promise<void>;
  hasOrganization: boolean;
  organizationSlugEnabled: boolean;
  onCancel?: () => void;
  flow: 'default' | 'organizationList';
  startPage: { headerTitle?: LocalizationKey; headerSubtitle?: LocalizationKey } | undefined;
};

export type CreateOrganizationFormViewProps = Pick<
  CreateOrganizationFormData,
  'isCreated' | 'hasOrganization' | 'organizationSlugEnabled' | 'flow' | 'startPage'
> & {
  wizardProps: { step: number; animate?: boolean };
  nameField: Pick<FormControlState<'name'>, 'id' | 'props'>;
  slugField: Pick<FormControlState<'slug'>, 'id' | 'props'>;
  name: string;
  canSubmit: boolean;
  isLoading: boolean;
  error?: string;
  file: File | null | undefined;
  setFile: (file: File | null | undefined) => void;
  onAvatarRemove: () => void;
  onChangeName: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeSlug: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onInviteSuccess: () => void;
  onComplete: () => Promise<void>;
  onCancel?: () => void;
};
