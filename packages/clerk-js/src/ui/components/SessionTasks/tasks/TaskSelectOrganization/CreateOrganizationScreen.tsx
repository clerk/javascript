import { useClerk, useOrganizationList } from '@clerk/shared/react';
import React, { useState } from 'react';

import { OrganizationAvatarUploader } from '@/ui/common/organizations/OrganizationAvatarUploader';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { descriptors, Icon, localizationKeys } from '@/ui/customizables';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { IconButton } from '@/ui/elements/IconButton';
import { Organization } from '@/ui/icons';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { organizationListParams } from '../../../OrganizationSwitcher/utils';

type CreateOrganizationScreenProps = {
  onCancel?: () => void;
};

export const CreateOrganizationScreen = withCardStateProvider((props: CreateOrganizationScreenProps) => {
  const card = useCardState();
  const { __internal_navigateToTaskIfAvailable } = useClerk();
  const { redirectUrlComplete } = useSessionTasksContext();
  const { createOrganization, isLoaded, setActive } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });

  const [file, setFile] = useState<File | null>();
  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });
  const slugField = useFormControl('slug', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationSlug'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationSlug'),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      const organization = await createOrganization({ name: nameField.value, slug: slugField.value });

      if (file) {
        await organization.setLogo({ file });
      }

      await setActive({ organization });

      await __internal_navigateToTaskIfAvailable({ redirectUrlComplete });
    } catch (err) {
      handleError(err, [nameField, slugField], card.setError);
    }
  };

  const onAvatarRemove = () => {
    card.setIdle();
    return setFile(null);
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    nameField.setValue(event.target.value);
    updateSlugField(createSlug(event.target.value));
  };

  const updateSlugField = (val: string) => {
    slugField.setValue(val);
  };

  const isSubmitButtonDisabled = !nameField.value || !isLoaded;

  return (
    <FormContainer>
      <Form.Root
        onSubmit={onSubmit}
        sx={t => ({ padding: `${t.space.$none} ${t.space.$10} ${t.space.$8}` })}
      >
        <OrganizationAvatarUploader
          organization={{ name: nameField.value }}
          onAvatarChange={async file => setFile(file)}
          onAvatarRemove={file ? onAvatarRemove : null}
          actionTitle={localizationKeys('taskSelectOrganization.createOrganizationScreen.action__uploadAvatar')}
          imageTitle={localizationKeys('taskSelectOrganization.createOrganizationScreen.avatarLabel')}
          elementDescriptor={descriptors.organizationAvatarUploaderContainer}
          avatarPreviewPlaceholder={
            <IconButton
              variant='ghost'
              aria-label='Upload organization logo'
              icon={
                <Icon
                  size='md'
                  icon={Organization}
                  sx={t => ({
                    color: t.colors.$colorMutedForeground,
                    transitionDuration: t.transitionDuration.$controls,
                  })}
                />
              }
              sx={t => ({
                width: t.sizes.$16,
                height: t.sizes.$16,
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$dashed,
                borderColor: t.colors.$borderAlpha200,
                backgroundColor: t.colors.$neutralAlpha50,
                ':hover': {
                  backgroundColor: t.colors.$neutralAlpha50,
                  svg: {
                    transform: 'scale(1.2)',
                  },
                },
              })}
            />
          }
        />
        <Form.ControlRow elementId={nameField.id}>
          <Form.PlainInput
            {...nameField.props}
            onChange={onChangeName}
            isRequired
            autoFocus
            ignorePasswordManager
          />
        </Form.ControlRow>
        <Form.ControlRow elementId={slugField.id}>
          <Form.PlainInput
            {...slugField.props}
            onChange={event => updateSlugField(event.target.value)}
            isRequired
            pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
            ignorePasswordManager
          />
        </Form.ControlRow>

        <FormButtonContainer sx={() => ({ flexDirection: 'column' })}>
          <Form.SubmitButton
            block
            isDisabled={isSubmitButtonDisabled}
            localizationKey={localizationKeys('taskSelectOrganization.createOrganizationScreen.formButtonSubmit')}
          />
          {props.onCancel && (
            <Form.ResetButton
              localizationKey={localizationKeys('taskSelectOrganization.createOrganizationScreen.formButtonReset')}
              onClick={props.onCancel}
            />
          )}
        </FormButtonContainer>
      </Form.Root>
    </FormContainer>
  );
});
