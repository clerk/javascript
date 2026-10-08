import { localizationKeys } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { InformationBox } from '@/ui/elements/InformationBox';

import type { ProfileFormViewProps } from './profile-form.types';
import { UserProfileAvatarUploader } from './UserProfileAvatarUploader';

export const ProfileFormView = (props: ProfileFormViewProps) => (
  <FormContainer headerTitle={localizationKeys('userProfile.profilePage.title')}>
    {props.nameEditDisabled && <InformationBox message={localizationKeys('userProfile.profilePage.readonly')} />}

    <Form.Root
      onSubmit={props.onSubmit}
      sx={t => ({ gap: t.space.$6 })}
    >
      <UserProfileAvatarUploader
        user={props.avatar}
        onAvatarChange={props.uploadAvatar}
        onAvatarRemove={props.canRemoveAvatar ? props.onAvatarRemove : null}
      />
      {(props.showFirstName || props.showLastName) && (
        <Form.ControlRow elementId='name'>
          {props.showFirstName && (
            <Form.PlainInput
              {...props.firstNameField.props}
              isDisabled={props.nameEditDisabled}
              autoFocus
            />
          )}
          {props.showLastName && (
            <Form.PlainInput
              {...props.lastNameField.props}
              isDisabled={props.nameEditDisabled}
              autoFocus={!props.showFirstName}
            />
          )}
        </Form.ControlRow>
      )}

      <FormButtons
        isDisabled={props.isSubmitDisabled}
        onReset={props.onReset}
      />
    </Form.Root>
  </FormContainer>
);
