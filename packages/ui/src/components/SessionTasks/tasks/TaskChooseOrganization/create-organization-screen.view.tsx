import { Icon, localizationKeys } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { IconButton } from '@/ui/elements/IconButton';
import { ArrowUpTray } from '@/ui/icons';

import { OrganizationProfileAvatarUploader } from '../../../OrganizationProfile/OrganizationProfileAvatarUploader';
import type { CreateOrganizationScreenViewProps } from './create-organization-screen.types';
import { OrganizationCreationDefaultsAlert } from './OrganizationCreationDefaultsAlert';
export const CreateOrganizationScreenView = (props: CreateOrganizationScreenViewProps) => (
  <>
    <Header.Root
      showLogo
      sx={t => ({ padding: `${t.space.$none} ${t.space.$8}` })}
    >
      <Header.Title localizationKey={localizationKeys('taskChooseOrganization.createOrganization.title')} />
      <Header.Subtitle localizationKey={localizationKeys('taskChooseOrganization.createOrganization.subtitle')} />
    </Header.Root>

    <FormContainer sx={t => ({ padding: `${t.space.$none} ${t.space.$10} ${t.space.$8}` })}>
      <Form.Root onSubmit={props.onSubmit}>
        <OrganizationCreationDefaultsAlert organizationCreationDefaults={props.organizationCreationDefaults} />
        <OrganizationProfileAvatarUploader
          isDisabled={props.isCreated}
          organization={{ name: props.name, imageUrl: props.defaultLogoUrl ?? undefined }}
          onAvatarChange={props.onAvatarChange}
          onAvatarRemove={props.hasAvatar ? props.onAvatarRemove : null}
          showLoadingSpinner={!!props.defaultLogoUrl}
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
              onChange={event => props.updateSlugField(event.target.value)}
              isRequired
              pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
              ignorePasswordManager
              isDisabled={props.isCreated}
            />
          </Form.ControlRow>
        )}

        <FormButtonContainer sx={() => ({ flexDirection: 'column' })}>
          <Form.SubmitButton
            block
            isDisabled={props.isSubmitButtonDisabled}
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
