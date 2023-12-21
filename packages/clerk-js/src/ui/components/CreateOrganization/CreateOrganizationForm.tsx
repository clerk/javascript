import { useOrganization, useOrganizationList } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { Col, Icon } from '../../customizables';
import { Form, FormButtonContainer, FormContent, Header, IconButton, SuccessPage, useCardState } from '../../elements';
import { Upload } from '../../icons';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { createSlug, handleError, useFormControl } from '../../utils';
import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersScreen';
import { OrganizationProfileAvatarUploader } from '../OrganizationProfile/OrganizationProfileAvatarUploader';

type CreateOrganizationFormProps = {
  skipInvitationScreen: boolean;
  navigateAfterCreateOrganization: (organization: OrganizationResource) => Promise<unknown>;
  onCancel?: () => void;
  onComplete?: () => void;
  flow: 'default' | 'organizationList';
  startPage?: {
    headerTitle?: LocalizationKey;
    headerSubtitle?: LocalizationKey;
  };
};

export const CreateOrganizationForm = (props: CreateOrganizationFormProps) => {
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const lastCreatedOrganizationRef = React.useRef<OrganizationResource | null>(null);
  const { createOrganization, isLoaded, setActive } = useOrganizationList();
  const { organization } = useOrganization();
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
  const canSubmit = dataChanged;

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

  const headerTitleTextVariant = 'h2';
  const headerSubtitleTextVariant = props.flow === 'organizationList' ? 'subtitle' : undefined;

  return (
    <Wizard {...wizard.props}>
      <FormContent
        Breadcrumbs={null}
        headerTitle={props?.startPage?.headerTitle}
        headerSubtitle={props?.startPage?.headerSubtitle}
        headerTitleTextVariant={headerTitleTextVariant}
        headerSubtitleTextVariant={headerSubtitleTextVariant}
        sx={t => ({ minHeight: t.sizes.$60, gap: t.space.$6, textAlign: 'left' })}
      >
        <Form.Root onSubmit={onSubmit}>
          <Col>
            <OrganizationProfileAvatarUploader
              organization={{ name: nameField.value }}
              onAvatarChange={async file => await setFile(file)}
              onAvatarRemove={file ? onAvatarRemove : null}
              avatarPreviewPlaceholder={
                <IconButton
                  variant='ghost'
                  aria-label='Upload organization logo'
                  icon={
                    <Icon
                      size='md'
                      icon={Upload}
                      sx={t => ({
                        color: t.colors.$blackAlpha400,
                        transitionDuration: t.transitionDuration.$controls,
                      })}
                    />
                  }
                  sx={t => ({
                    width: t.sizes.$16,
                    height: t.sizes.$16,
                    borderRadius: t.radii.$md,
                    border: `${t.borders.$dashed} ${t.colors.$blackAlpha200}`,
                    backgroundColor: t.colors.$blackAlpha50,
                    ':hover': {
                      backgroundColor: t.colors.$blackAlpha50,
                      svg: {
                        transform: 'scale(1.2)',
                      },
                    },
                  })}
                />
              }
            />
          </Col>
          <Form.ControlRow elementId={nameField.id}>
            <Form.PlainInput
              {...nameField.props}
              sx={{ flexBasis: '80%' }}
              onChange={onChangeName}
              isRequired
              autoFocus
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={slugField.id}>
            <Form.PlainInput
              {...slugField.props}
              sx={{ flexBasis: '80%' }}
              onChange={onChangeSlug}
              isRequired
            />
          </Form.ControlRow>
          <FormButtonContainer>
            <Form.SubmitButton
              block={false}
              isDisabled={!canSubmit}
              hasArrow
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
      </FormContent>

      <FormContent
        Breadcrumbs={null}
        headerTitle={localizationKeys('organizationProfile.invitePage.title')}
        headerTitleTextVariant={headerTitleTextVariant}
        headerSubtitleTextVariant={headerSubtitleTextVariant}
        sx={t => ({ minHeight: t.sizes.$60, textAlign: 'left' })}
      >
        {organization && (
          <InviteMembersForm
            resetButtonLabel={localizationKeys('createOrganization.invitePage.formButtonReset')}
            onSuccess={wizard.nextStep}
            onReset={completeFlow}
          />
        )}
      </FormContent>
      <Col>
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.invitePage.title')}
            sx={{ textAlign: 'left' }}
          />
        </Header.Root>
        <SuccessPage
          contents={<InvitationsSentMessage />}
          sx={t => ({ minHeight: t.sizes.$60 })}
          onFinish={completeFlow}
        />
      </Col>
    </Wizard>
  );
};
