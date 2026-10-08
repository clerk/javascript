import type { ChangeEvent, FormEvent } from 'react';

import type { FormControlState } from '@/ui/utils/useFormControl';

import type { OrganizationCreationDefaultsData } from './task-choose-organization.types';

export type CreateOrganizationScreenData = {
  scopeKey: string;
  canRun: () => boolean;
  isCreated: boolean;
  onCancel?: () => void;
  isLoaded: boolean;
  organizationSlugEnabled: boolean;
  create: (
    name: string,
    slug: string,
    file?: File | null,
    defaultLogoUrl?: string | null,
    canContinue?: () => boolean,
  ) => Promise<void>;
};

export type CreateOrganizationScreenFormProps = {
  isCreated: boolean;
  name: string;
  nameField: Pick<FormControlState<'name'>, 'id' | 'props'>;
  slugField: Pick<FormControlState<'slug'>, 'id' | 'props'>;
  organizationSlugEnabled: boolean;
  defaultLogoUrl: string | null | undefined;
  hasAvatar: boolean;
  isSubmitButtonDisabled: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onChangeName: (event: ChangeEvent<HTMLInputElement>) => void;
  updateSlugField: (value: string) => void;
  onAvatarChange: (file: File) => Promise<void>;
  onAvatarRemove: () => void;
};

export type CreateOrganizationScreenViewProps = CreateOrganizationScreenFormProps & {
  onCancel?: () => void;
  organizationCreationDefaults?: OrganizationCreationDefaultsData | null;
};
