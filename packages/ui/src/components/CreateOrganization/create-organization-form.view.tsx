import { Wizard } from '@/ui/common';
import { Col, Icon } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { IconButton } from '@/ui/elements/IconButton';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { ArrowUpTray } from '@/ui/icons';

import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersScreen';
import { OrganizationProfileAvatarUploader } from '../OrganizationProfile/OrganizationProfileAvatarUploader';
import { createOrganizationMessages } from './create-organization.messages';
import type { CreateOrganizationFormViewProps } from './create-organization-form.types';

export const CreateOrganizationFormView = (props: CreateOrganizationFormViewProps) => {
  return (
    <Wizard {...props.wizardProps}>
      <FormContainer
        headerTitle={props.startPage?.headerTitle}
        headerSubtitle={props.startPage?.headerSubtitle}
        headerTitleTextVariant='h2'
        headerSubtitleTextVariant={props.flow === 'organizationList' ? 'subtitle' : undefined}
        sx={t => ({ minHeight: t.sizes.$60, gap: t.space.$6, textAlign: 'start' })}
      >
        <Form.Root
          onSubmit={props.onSubmit}
          sx={t => ({ gap: t.space.$6 })}
        >
          <Col>
            <OrganizationProfileAvatarUploader
              isDisabled={props.isCreated}
              organization={{ name: props.name }}
              onAvatarChange={file => Promise.resolve(props.setFile(file))}
              onAvatarRemove={props.file ? props.onAvatarRemove : null}
              avatarPreviewPlaceholder={
                <IconButton
                  variant='ghost'
                  aria-label='Upload organization logo'
                  icon={
                    <Icon
                      size='md'
                      icon={ArrowUpTray}
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
          <Form.ControlRow elementId={props.nameField.id}>
            <Form.PlainInput
              {...props.nameField.props}
              onChange={props.onChangeName}
              isRequired
              autoFocus
              ignorePasswordManager
              isDisabled={props.isCreated}
            />
          </Form.ControlRow>
          {props.organizationSlugEnabled && (
            <Form.ControlRow elementId={props.slugField.id}>
              <Form.PlainInput
                {...props.slugField.props}
                onChange={props.onChangeSlug}
                isRequired
                pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
                ignorePasswordManager
                isDisabled={props.isCreated}
              />
            </Form.ControlRow>
          )}
          <FormButtonContainer sx={t => ({ marginTop: t.space.$none })}>
            <Form.SubmitButton
              block={false}
              isDisabled={!props.canSubmit}
              localizationKey={createOrganizationMessages.actions.submit}
            />
            {props.onCancel && (
              <Form.ResetButton
                localizationKey={createOrganizationMessages.actions.reset}
                block={false}
                onClick={props.onCancel}
              />
            )}
          </FormButtonContainer>
        </Form.Root>
      </FormContainer>

      <FormContainer
        headerTitle={createOrganizationMessages.invitation.title}
        headerTitleTextVariant='h2'
        headerSubtitleTextVariant={props.flow === 'organizationList' ? 'subtitle' : undefined}
        sx={() => ({ textAlign: 'start' })}
      >
        {props.hasOrganization && (
          <InviteMembersForm
            resetButtonLabel={createOrganizationMessages.invitation.reset}
            onSuccess={props.onInviteSuccess}
            onReset={() => void props.onComplete()}
          />
        )}
      </FormContainer>

      <Col>
        <Header.Root>
          <Header.Title
            localizationKey={createOrganizationMessages.invitation.title}
            sx={{ textAlign: 'start' }}
          />
        </Header.Root>
        <Card.Alert>{props.error}</Card.Alert>
        <SuccessPage
          finishButtonProps={{ isDisabled: props.isLoading, isLoading: props.isLoading }}
          contents={<InvitationsSentMessage />}
          onFinish={() => void props.onComplete()}
        />
      </Col>
    </Wizard>
  );
};
