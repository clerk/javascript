import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type {
  CreateOrganizationScreenData,
  CreateOrganizationScreenFormProps,
} from './create-organization-screen.types';
import type { OrganizationCreationDefaultsData } from './task-choose-organization.types';

export const useCreateOrganizationScreenController = (
  model: CreateOrganizationScreenData,
  organizationCreationDefaults?: OrganizationCreationDefaultsData | null,
): CreateOrganizationScreenFormProps => {
  const card = useCardState();
  const [file, setFile] = useState<File | null>();
  const nameField = useFormControl('name', organizationCreationDefaults?.form?.name ?? '', {
    type: 'text',
    label: localizationKeys('taskChooseOrganization.createOrganization.formFieldLabel__name'),
    placeholder: localizationKeys('taskChooseOrganization.createOrganization.formFieldInputPlaceholder__name'),
  });
  const slugField = useFormControl('slug', organizationCreationDefaults?.form?.slug ?? '', {
    type: 'text',
    label: localizationKeys('taskChooseOrganization.createOrganization.formFieldLabel__slug'),
    placeholder: localizationKeys('taskChooseOrganization.createOrganization.formFieldInputPlaceholder__slug'),
  });
  const defaultLogoUrl = file === undefined ? organizationCreationDefaults?.form?.logo : undefined;

  const mounted = useRef(true);
  const current = useRef({ key: model.scopeKey, generation: {}, pending: undefined as Promise<void> | undefined });
  if (current.current.key !== model.scopeKey) {
    current.current = { key: model.scopeKey, generation: {}, pending: undefined };
  }
  const owner = current.current;
  const latest = useRef({ card, nameField, slugField, model });
  latest.current = { card, nameField, slugField, model };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canRun() || !model.isLoaded || !nameField.value) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const origin = owner.generation;
    const ownsRequest = () => mounted.current && current.current === owner && owner.generation === origin;
    latest.current.card.setError(undefined);
    const request = Promise.resolve()
      .then(() => {
        if (ownsRequest()) {
          return model.create(nameField.value, slugField.value, file, defaultLogoUrl, ownsRequest);
        }
        return;
      })
      .catch(error => {
        if (ownsRequest() && latest.current.model.canRun()) {
          const { card, nameField, slugField } = latest.current;
          handleError(error, [nameField, slugField], card.setError);
        }
      })
      .finally(() => {
        if (owner.pending === request) {
          owner.pending = undefined;
        }
      });
    owner.pending = request;
    return request;
  };

  const updateSlugField = (value: string) => {
    if (canRun() && !owner.pending && !latest.current.model.isCreated) {
      slugField.setValue(value);
    }
  };
  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    if (!canRun() || owner.pending || latest.current.model.isCreated) {
      return;
    }
    nameField.setValue(event.target.value);
    updateSlugField(createSlug(event.target.value));
  };
  const onAvatarRemove = () => {
    if (!canRun() || owner.pending || latest.current.model.isCreated) {
      return;
    }
    return setFile(null);
  };

  return {
    isCreated: model.isCreated,
    name: nameField.value,
    nameField: { id: nameField.id, props: nameField.props },
    slugField: { id: slugField.id, props: slugField.props },
    organizationSlugEnabled: model.organizationSlugEnabled,
    defaultLogoUrl,
    hasAvatar: Boolean(file || defaultLogoUrl),
    isSubmitButtonDisabled: !nameField.value || !model.isLoaded || card.isLoading,
    onSubmit,
    onChangeName,
    updateSlugField,
    onAvatarChange: (nextFile: File) => {
      if (canRun() && !owner.pending && !latest.current.model.isCreated) {
        setFile(nextFile);
      }
      return Promise.resolve();
    },
    onAvatarRemove,
  };
};
