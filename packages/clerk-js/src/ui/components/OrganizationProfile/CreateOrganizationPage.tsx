import React from 'react';

import { useWizard, Wizard } from '../../common';
import {
  AvatarUploader,
  Form,
  Select,
  SelectButton,
  SelectOptionList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { localizationKeys } from '../../localization';
import { useFormControl } from '../../utils';
import { FormButtons } from '../UserProfile/FormButtons';
import { SuccessPage } from '../UserProfile/SuccessPage';
import { ContentPage } from './OrganizationContentPage';

export const CreateOrganizationPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Create Organization';
  const subtitle = 'Set the organization profile';
  const card = useCardState();
  const [avatarChanged, setAvatarChanged] = React.useState(false);

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const organizationName = useFormControl('name', '', {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Organization Name',
    placeholder: '',
  });

  const dataChanged = 'placeholder' !== organizationName.value;
  const canSubmit = dataChanged || avatarChanged;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    wizard.nextStep();

    // return (
    // dataChanged
    //   ? user.update({ firstName: organizationName.value, lastName: lastNameField.value })
    // : Promise.resolve()
    // )
    //   .then(() => {
    //     wizard.nextStep();
    //   })
    // .catch(err => {
    //   handleError(err, [organizationName, lastNameField], card.setError);
    // });
  };

  const uploadAvatar = (file: File) => {
    // return user.setProfileImage({ file }).then(() => {
    //   setAvatarChanged(true);
    // });
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <Form.Root onSubmit={onSubmit}>
          <AvatarUploader onAvatarChange={uploadAvatar} />
          <Form.ControlRow>
            <Form.Control
              sx={{ flexBasis: '80%' }}
              {...organizationName.props}
              required
            />
          </Form.ControlRow>
          <FormButtons
            // localizationKey={localizationKeys('createOrganization')}
            isDisabled={!canSubmit}
          />
        </Form.Root>
      </ContentPage>
      <SuccessPage
        title={title}
        // text={localizationKeys('userProfile.profilePage.successMessage')}
        text={'Organization created successfully'}
      />
    </Wizard>
  );
});
