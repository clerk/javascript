import { localizationKeys } from '@/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { OrganizationProfileAvatarUploader } from './OrganizationProfileAvatarUploader';
import type { OrganizationProfileFormViewProps } from './profile-form.types';

export const OrganizationProfileFormView = (props: OrganizationProfileFormViewProps) => (
  <FormContainer headerTitle={localizationKeys('organizationProfile.profilePage.title')}>
    <Form.Root onSubmit={props.onSubmit}>
      <OrganizationProfileAvatarUploader
        organization={props.avatar}
        onAvatarChange={props.uploadAvatar}
        onAvatarRemove={props.canRemoveAvatar ? props.onAvatarRemove : null}
      />
      <Form.ControlRow elementId={props.nameField.id}>
        <Form.PlainInput
          {...props.nameField.props}
          autoFocus
          isRequired
          ignorePasswordManager
        />
      </Form.ControlRow>
      {props.slugEnabled && (
        <Form.ControlRow elementId={props.slugField.id}>
          <Form.PlainInput
            {...props.slugField.props}
            onChange={props.onChangeSlug}
            ignorePasswordManager
          />
        </Form.ControlRow>
      )}
      <FormButtons
        isDisabled={!props.canSubmit}
        onReset={props.onReset}
      />
    </Form.Root>
  </FormContainer>
);
