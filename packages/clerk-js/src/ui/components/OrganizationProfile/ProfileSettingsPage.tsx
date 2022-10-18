import React from 'react';

import { useWizard, Wizard } from '../../common';
import { localizationKeys } from '../../customizables';
import { AvatarUploader, Form, useCardState, withCardStateProvider } from '../../elements';
import { useFormControl } from '../../utils';
import { FormButtons } from '../UserProfile/FormButtons';
import { SuccessPage } from '../UserProfile/SuccessPage';
import { ContentPage } from './OrganizationContentPage';

export const ProfileSettingsPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Organization profile';
  const subtitle = 'Manage organization profile';
  const card = useCardState();
  const [avatarChanged, setAvatarChanged] = React.useState(false);

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const organizationName = useFormControl('name', 'placeholder' || '', {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Organization name',
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
    console.log(file);
    return Promise.resolve();
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
              {...organizationName.props}
              required
            />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage>
      <SuccessPage
        title={title}
        text={localizationKeys('userProfile.profilePage.successMessage')}
      />
    </Wizard>
  );
});
