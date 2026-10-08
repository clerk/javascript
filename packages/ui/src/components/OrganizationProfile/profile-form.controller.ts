import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef } from 'react';

import { localizationKeys } from '@/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { OrganizationProfileFormReadyData, OrganizationProfileFormViewProps } from './profile-form.types';

export const useOrganizationProfileFormController = (
  model: OrganizationProfileFormReadyData,
): OrganizationProfileFormViewProps => {
  const card = useCardState();
  const nameField = useFormControl('name', model.name, {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });
  const slugField = useFormControl('slug', model.initialSlug, {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationSlug'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationSlug'),
  });
  const dataChanged = model.name !== nameField.value || model.slug !== slugField.value;
  const canSubmit = dataChanged && slugField.feedbackType !== 'error';

  const mounted = useRef(true);
  const pendingSave = useRef<Promise<void>>();
  const latest = useRef({ card, nameField, slugField });
  latest.current = { card, nameField, slugField };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingSave.current = undefined;
    };
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!mounted.current) {
      return Promise.resolve();
    }
    if (pendingSave.current) {
      return pendingSave.current;
    }
    const params = { name: nameField.value, ...(model.slugEnabled ? { slug: slugField.value } : {}) };
    const ownsRequest = () => mounted.current && pendingSave.current === request;
    const request = (async () => {
      if (canSubmit) {
        await model.update(params);
      } else {
        await model.complete();
      }
    })()
      .catch(error => {
        if (ownsRequest()) {
          const { card, nameField, slugField } = latest.current;
          handleError(error, [nameField, slugField], card.setError);
        }
      })
      .finally(() => {
        if (ownsRequest()) {
          pendingSave.current = undefined;
        }
      });
    pendingSave.current = request;
    return request;
  };

  const changeAvatar = (file: File | null) =>
    model.setLogo(file).catch(error => {
      if (mounted.current) {
        handleError(error, [], latest.current.card.setError);
      }
    });

  const onChangeSlug = (event: ChangeEvent<HTMLInputElement>) => {
    if (mounted.current) {
      slugField.setValue(event.target.value);
      slugField.clearFeedback();
    }
  };

  return {
    nameField: { id: nameField.id, props: nameField.props },
    slugField: { id: slugField.id, props: slugField.props },
    canSubmit,
    onSubmit,
    uploadAvatar: file => changeAvatar(file),
    onAvatarRemove: () => changeAvatar(null),
    onChangeSlug,
    avatar: model.avatar,
    canRemoveAvatar: model.canRemoveAvatar,
    slugEnabled: model.slugEnabled,
    onReset: model.onReset,
  };
};
