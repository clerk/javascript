import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useWizard } from '@/ui/common';
import { useCardState } from '@/ui/elements/contexts';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { createOrganizationMessages } from './create-organization.messages';
import type { CreateOrganizationFormData, CreateOrganizationFormViewProps } from './create-organization-form.types';

export const useCreateOrganizationFormController = (
  model: CreateOrganizationFormData,
): CreateOrganizationFormViewProps => {
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const [file, setFile] = useState<File | null>();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: createOrganizationMessages.fields.name.label,
    placeholder: createOrganizationMessages.fields.name.placeholder,
  });
  const slugField = useFormControl('slug', '', {
    type: 'text',
    label: createOrganizationMessages.fields.slug.label,
    placeholder: createOrganizationMessages.fields.slug.placeholder,
  });

  const mounted = useRef(true);
  const current = useRef({
    key: model.scopeKey,
    generation: {},
    pending: undefined as Promise<void> | undefined,
    release: undefined as (() => void) | undefined,
  });
  if (current.current.key !== model.scopeKey) {
    current.current = { key: model.scopeKey, generation: {}, pending: undefined, release: undefined };
  }
  const owner = current.current;
  const latest = useRef({ card, nameField, slugField, wizard, model });
  latest.current = { card, nameField, slugField, wizard, model };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
      owner.release?.();
      owner.release = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  const run = (operation: (ownsRequest: () => boolean) => Promise<void>, ownsLoading = false) => {
    if (!canRun()) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const release = ownsLoading ? latest.current.card.beginRequest() : undefined;
    if (ownsLoading && !release) {
      return Promise.resolve();
    }
    owner.release = release;
    const origin = owner.generation;
    const ownsRequest = () => canRun() && owner.generation === origin;
    latest.current.card.setError(undefined);
    const request = Promise.resolve()
      .then(() => {
        if (ownsRequest()) {
          return operation(ownsRequest);
        }
        return;
      })
      .catch(error => {
        if (ownsRequest()) {
          const { card, nameField, slugField } = latest.current;
          handleError(error, [nameField, slugField], card.setError);
        }
      })
      .finally(() => {
        if (owner.pending === request) {
          owner.pending = undefined;
          owner.release = undefined;
        }
        release?.();
      });
    owner.pending = request;
    return request;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!nameField.value) {
      return Promise.resolve();
    }
    return run(async ownsRequest => {
      const result = await model.create({ name: nameField.value, slug: slugField.value, file }, ownsRequest);
      if (!result || !ownsRequest()) {
        return;
      }
      if (result.skipInvitations) {
        await model.complete(ownsRequest);
      } else {
        latest.current.wizard.nextStep();
      }
    });
  };
  const onComplete = () => run(ownsRequest => model.complete(ownsRequest), true);

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    if (!canRun() || owner.pending || latest.current.model.isCreated) {
      return;
    }
    nameField.setValue(event.target.value);
    slugField.setValue(createSlug(event.target.value));
  };
  const onChangeSlug = (event: ChangeEvent<HTMLInputElement>) => {
    if (canRun() && !owner.pending && !latest.current.model.isCreated) {
      slugField.setValue(event.target.value);
    }
  };
  const onAvatarRemove = () => {
    if (!canRun() || owner.pending || latest.current.model.isCreated) {
      return;
    }
    return setFile(null);
  };

  return {
    isCreated: model.isCreated,
    wizardProps: wizard.props,
    nameField: { id: nameField.id, props: nameField.props },
    slugField: { id: slugField.id, props: slugField.props },
    name: nameField.value,
    canSubmit: !!nameField.value && !card.isLoading,
    isLoading: card.isLoading,
    error: card.error,
    file,
    setFile: nextFile => {
      if (canRun() && !owner.pending && !latest.current.model.isCreated) {
        setFile(nextFile);
      }
    },
    onAvatarRemove,
    onChangeName,
    onChangeSlug,
    onSubmit,
    onInviteSuccess: () => {
      if (canRun() && !owner.pending) {
        latest.current.wizard.nextStep();
      }
    },
    onComplete,
    hasOrganization: model.hasOrganization,
    organizationSlugEnabled: model.organizationSlugEnabled,
    onCancel: model.onCancel
      ? () => {
          if (canRun() && !owner.pending) {
            model.onCancel?.();
          }
        }
      : undefined,
    flow: model.flow,
    startPage: model.startPage,
  };
};
