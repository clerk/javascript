import type { OrganizationResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreOrganization, useCoreOrganizationList } from '../../contexts';
import { ContentPage, Form, FormButtonContainer, SuccessPage, useCardState } from '../../elements';
import { QuestionMark } from '../../icons';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { createSlug, handleError, useFormControl } from '../../utils';
import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersPage';
import { OrganizationProfileAvatarUploader } from '../OrganizationProfile/OrganizationProfileAvatarUploader';

type CreateOrganizationFormProps = {
  skipInvitationScreen: boolean;
  navigateAfterCreateOrganization: (organization: OrganizationResource) => Promise<unknown>;
  onCancel?: () => void;
  onComplete?: () => void;
  flow: 'default' | 'organizationList';
  startPage: {
    headerTitle: LocalizationKey;
    headerSubtitle?: LocalizationKey;
  };
};

export const CreateOrganizationForm = (props: CreateOrganizationFormProps) => {
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const lastCreatedOrganizationRef = React.useRef<OrganizationResource | null>(null);
  const { createOrganization, isLoaded, setActive } = useCoreOrganizationList();
  const { organization } = useCoreOrganization();
  const [file, setFile] = React.useState<File | null>();

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

    if (!isLoaded) {
      return;
    }

    try {
      const organization = await createOrganization({ name: nameField.value, slug: slugField.value });
      if (file) {
        await organization.setLogo({ file });
      }

      lastCreatedOrganizationRef.current = organization;
      await setActive({ organization });

      if (props.skipInvitationScreen ?? organization.maxAllowedMemberships === 1) {
        return completeFlow();
      }

      wizard.nextStep();
    } catch (err) {
      handleError(err, [nameField, slugField], card.setError);
    }
  };

  const completeFlow = () => {
    // We are confident that lastCreatedOrganizationRef.current will never be null
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    void props.navigateAfterCreateOrganization(lastCreatedOrganizationRef.current!);

    props.onComplete?.();
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
    updateSlugField(event.target.value);
  };

  const updateSlugField = (val: string) => {
    slugField.setValue(val);
  };

  const headerTitleTextVariant = props.flow === 'organizationList' ? 'xlargeMedium' : undefined;
  const headerSubtitleTextVariant = props.flow === 'organizationList' ? 'headingRegularRegular' : undefined;

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={props.startPage.headerTitle}
        headerSubtitle={props.startPage.headerSubtitle}
        headerTitleTextVariant={headerTitleTextVariant}
        headerSubtitleTextVariant={headerSubtitleTextVariant}
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
            {props.onCancel && (
              <Form.ResetButton
                localizationKey={localizationKeys('userProfile.formButtonReset')}
                block={false}
                onClick={props.onCancel}
              />
            )}
          </FormButtonContainer>
        </Form.Root>
      </ContentPage>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={localizationKeys('organizationProfile.invitePage.title')}
        headerTitleTextVariant={headerTitleTextVariant}
        headerSubtitleTextVariant={headerSubtitleTextVariant}
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
        title={localizationKeys('organizationProfile.invitePage.title')}
        headerTitleTextVariant={headerTitleTextVariant}
        contents={<InvitationsSentMessage />}
        sx={t => ({ minHeight: t.sizes.$60 })}
        onFinish={completeFlow}
      />
    </Wizard>
  );
};
