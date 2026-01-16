import { useOrganizationList } from '@clerk/shared/react';
import type { CreateOrganizationParams, OrganizationCreationDefaultsResource } from '@clerk/shared/types';
import { useState } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { useSessionTasksContext, useTaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { Icon, localizationKeys } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { IconButton } from '@/ui/elements/IconButton';
import { Upload } from '@/ui/icons';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { OrganizationProfileAvatarUploader } from '../../../OrganizationProfile/OrganizationProfileAvatarUploader';
import { organizationListParams } from '../../../OrganizationSwitcher/utils';
import { OrganizationCreationDefaultsAlert } from './OrganizationCreationDefaultsAlert';

type CreateOrganizationScreenProps = {
  onCancel?: () => void;
  organizationCreationDefaults?: OrganizationCreationDefaultsResource;
};

export const CreateOrganizationScreen = (props: CreateOrganizationScreenProps) => {
  const card = useCardState();
  const { navigateOnSetActive } = useSessionTasksContext();
  const { redirectUrlComplete } = useTaskChooseOrganizationContext();
  const { createOrganization, isLoaded, setActive } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });
  const { organizationSettings } = useEnvironment();
  const [file, setFile] = useState<File | null>();

  const nameField = useFormControl('name', props.organizationCreationDefaults?.form.name ?? '', {
    type: 'text',
    label: localizationKeys('taskChooseOrganization.createOrganization.formFieldLabel__name'),
    placeholder: localizationKeys('taskChooseOrganization.createOrganization.formFieldInputPlaceholder__name'),
  });
  const slugField = useFormControl('slug', props.organizationCreationDefaults?.form.slug ?? '', {
    type: 'text',
    label: localizationKeys('taskChooseOrganization.createOrganization.formFieldLabel__slug'),
    placeholder: localizationKeys('taskChooseOrganization.createOrganization.formFieldInputPlaceholder__slug'),
  });

  const organizationSlugEnabled = !organizationSettings.slug.disabled;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      const createOrgParams: CreateOrganizationParams = { name: nameField.value };

      if (organizationSlugEnabled) {
        createOrgParams.slug = slugField.value;
      }

      const organization = await createOrganization(createOrgParams);

      if (file) {
        await organization.setLogo({ file });
      } else if (defaultLogoUrl) {
        const response = await fetch(defaultLogoUrl);
        const blob = await response.blob();
        const logoFile = new File([blob], 'logo', { type: blob.type });
        await organization.setLogo({ file: logoFile });
      }

      await setActive({
        organization,
        navigate: async ({ session }) => {
          await navigateOnSetActive?.({ session, redirectUrlComplete });
        },
      });
    } catch (err: any) {
      handleError(err, [nameField, slugField], card.setError);
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    nameField.setValue(event.target.value);
    updateSlugField(createSlug(event.target.value));
  };

  const updateSlugField = (val: string) => {
    slugField.setValue(val);
  };

  const onAvatarRemove = () => {
    card.setIdle();
    return setFile(null);
  };

  const isSubmitButtonDisabled = !nameField.value || !isLoaded;
  const defaultLogoUrl = file === undefined ? props.organizationCreationDefaults?.form.logo : undefined;

  return (
    <>
      <Header.Root
        showLogo
        sx={t => ({ padding: `${t.space.$none} ${t.space.$8}` })}
      >
        <Header.Title localizationKey={localizationKeys('taskChooseOrganization.createOrganization.title')} />
        <Header.Subtitle localizationKey={localizationKeys('taskChooseOrganization.createOrganization.subtitle')} />
      </Header.Root>

      <FormContainer sx={t => ({ padding: `${t.space.$none} ${t.space.$10} ${t.space.$8}` })}>
        <Form.Root onSubmit={onSubmit}>
          <OrganizationCreationDefaultsAlert organizationCreationDefaults={props.organizationCreationDefaults} />
          <OrganizationProfileAvatarUploader
            organization={{ name: nameField.value, imageUrl: defaultLogoUrl ?? undefined }}
            onAvatarChange={async file => await setFile(file)}
            onAvatarRemove={file || defaultLogoUrl ? onAvatarRemove : null}
            showLoadingSpinner={!!defaultLogoUrl}
            avatarPreviewPlaceholder={
              <IconButton
                variant='ghost'
                aria-label='Upload organization logo'
                icon={
                  <Icon
                    size='md'
                    icon={Upload}
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
          {organizationSlugEnabled && (
            <Form.ControlRow elementId={slugField.id}>
              <Form.PlainInput
                {...slugField.props}
                onChange={event => updateSlugField(event.target.value)}
                isRequired
                pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
                ignorePasswordManager
              />
            </Form.ControlRow>
          )}

          <FormButtonContainer sx={() => ({ flexDirection: 'column' })}>
            <Form.SubmitButton
              block
              isDisabled={isSubmitButtonDisabled}
              localizationKey={localizationKeys('taskChooseOrganization.createOrganization.formButtonSubmit')}
            />
            {props.onCancel && (
              <Form.ResetButton
                localizationKey={localizationKeys('taskChooseOrganization.createOrganization.formButtonReset')}
                onClick={props.onCancel}
              />
            )}
          </FormButtonContainer>
        </Form.Root>
      </FormContainer>
    </>
  );
};
