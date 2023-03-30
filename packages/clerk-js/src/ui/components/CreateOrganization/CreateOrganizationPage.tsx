import React from 'react';

import { QuestionMark } from '../../../ui/icons';
import { createSlug, isValidSlug } from '../../../ui/utils';
import { useWizard, Wizard } from '../../common';
import { useCoreClerk, useCoreOrganization, useCoreOrganizations, useCreateOrganizationContext } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import {
  ContentPage,
  Form,
  FormButtonContainer,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersPage';
import { OrganizationProfileAvatarUploader } from '../OrganizationProfile/OrganizationProfileAvatarUploader';

export const CreateOrganizationPage = withCardStateProvider(() => {
  const title = localizationKeys('createOrganization.title');
  const inviteTitle = localizationKeys('organizationProfile.invitePage.title');
  const card = useCardState();
  const { t } = useLocalizations();
  const [file, setFile] = React.useState<File | null>();
  const { createOrganization } = useCoreOrganizations();
  const { setActive, closeCreateOrganization } = useCoreClerk();
  const { mode, navigateAfterCreateOrganization } = useCreateOrganizationContext();
  const { organization } = useCoreOrganization();

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

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

  const dataChanged = !!nameField.value;
  const canSubmit = dataChanged || !!file;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    return createOrganization?.({ name: nameField.value, slug: slugField.value })
      .then(org => (file ? org.setLogo({ file }) : org))
      .then(org => setActive({ organization: org }))
      .then(wizard.nextStep)
      .catch(err => handleError(err, [nameField, slugField], card.setError));
  };

  const completeFlow = () => {
    navigateAfterCreateOrganization();
    if (mode === 'modal') {
      closeCreateOrganization();
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

  const onChangeSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value && !isValidSlug(event.target.value)) {
      updateSlugField(event.target.value, t(localizationKeys('formFieldErrorText__organizationSlug')));
      return;
    }

    updateSlugField(createSlug(event.target.value));
  };

  const updateSlugField = (val: string, errorMessage?: string | undefined) => {
    slugField.setValue(val);
    slugField.setError(errorMessage as string);
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={title}
        sx={t => ({ minHeight: t.sizes.$60 })}
      >
        <Form.Root onSubmit={onSubmit}>
          <OrganizationProfileAvatarUploader
            organization={{ name: nameField.value }}
            onAvatarChange={async file => await setFile(file)}
            onAvatarRemove={file ? onAvatarRemove : null}
          />
          <Form.ControlRow elementId={nameField.id}>
            <Form.Control
              sx={{ flexBasis: '80%' }}
              autoFocus
              {...nameField.props}
              onChange={onChangeName}
              required
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={slugField.id}>
            <Form.Control
              sx={{ flexBasis: '80%' }}
              {...slugField.props}
              onChange={onChangeSlug}
              icon={QuestionMark}
              required
            />
          </Form.ControlRow>
          <FormButtonContainer>
            <Form.SubmitButton
              block={false}
              isDisabled={!canSubmit}
              localizationKey={localizationKeys('createOrganization.formButtonSubmit')}
            />
            {mode === 'modal' && (
              <Form.ResetButton
                localizationKey={localizationKeys('userProfile.formButtonReset')}
                block={false}
                onClick={closeCreateOrganization}
              />
            )}
          </FormButtonContainer>
        </Form.Root>
      </ContentPage>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={inviteTitle}
        sx={t => ({ minHeight: t.sizes.$60 })}
      >
        {organization && (
          <InviteMembersForm
            organization={organization}
            resetButtonLabel={localizationKeys('createOrganization.invitePage.formButtonReset')}
            onSuccess={wizard.nextStep}
            onReset={completeFlow}
          />
        )}
      </ContentPage>
      <SuccessPage
        title={title}
        content={<InvitationsSentMessage />}
        sx={t => ({ minHeight: t.sizes.$60 })}
        onFinish={completeFlow}
      />
    </Wizard>
  );
});
