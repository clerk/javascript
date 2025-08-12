import { useOrganization, useOrganizationList } from '@clerk/shared/react';
import type { CreateOrganizationParams, OrganizationResource } from '@clerk/types';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { IconButton } from '@/ui/elements/IconButton';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../common';
import { Col, Icon } from '../../customizables';
import { Upload } from '../../icons';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersScreen';
import { OrganizationProfileAvatarUploader } from '../OrganizationProfile/OrganizationProfileAvatarUploader';
import { organizationListParams } from '../OrganizationSwitcher/utils';

type CreateOrganizationFormProps = {
  skipInvitationScreen: boolean;
  navigateAfterCreateOrganization?: (organization: OrganizationResource) => Promise<unknown>;
  onCancel?: () => void;
  onComplete?: () => void;
  flow: 'default' | 'organizationList';
  startPage?: {
    headerTitle?: LocalizationKey;
    headerSubtitle?: LocalizationKey;
  };
  hideSlug?: boolean;
};

export const CreateOrganizationForm = withCardStateProvider((props: CreateOrganizationFormProps) => {
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const lastCreatedOrganizationRef = React.useRef<OrganizationResource | null>(null);
  const { createOrganization, isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });
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
      const createOrgParams: CreateOrganizationParams = { name: nameField.value };

      if (!props.hideSlug) {
        createOrgParams.slug = slugField.value;
      }

      const organization = await createOrganization(createOrgParams);
      if (file) {
        await organization.setLogo({ file });
      }

      lastCreatedOrganizationRef.current = organization;
      await setActive({ organization });

      void userMemberships.revalidate?.();

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
    void props.navigateAfterCreateOrganization?.(lastCreatedOrganizationRef.current!);

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
      <FormContainer
        headerTitle={props?.startPage?.headerTitle}
        headerSubtitle={props?.startPage?.headerSubtitle}
        headerTitleTextVariant={headerTitleTextVariant}
        headerSubtitleTextVariant={headerSubtitleTextVariant}
        sx={t => ({ minHeight: t.sizes.$60, gap: t.space.$6, textAlign: 'left' })}
      >
        <Form.Root
          onSubmit={onSubmit}
          sx={t => ({ gap: t.space.$6 })}
        >
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
          </Col>
          <Form.ControlRow elementId={nameField.id}>
            <Form.PlainInput
              {...nameField.props}
              onChange={onChangeName}
              isRequired
              autoFocus
              ignorePasswordManager
            />
          </Form.ControlRow>
          {!props.hideSlug && (
            <Form.ControlRow elementId={slugField.id}>
              <Form.PlainInput
                {...slugField.props}
                onChange={onChangeSlug}
                isRequired
                pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
                ignorePasswordManager
              />
            </Form.ControlRow>
          )}
          <FormButtonContainer sx={t => ({ marginTop: t.space.$none })}>
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
      </FormContainer>

      <FormContainer
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
      </FormContainer>

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
});
