import React from 'react';

import { useWizard, Wizard } from '../../common';
import { Form, Select, SelectButton, SelectOptionList, useCardState, withCardStateProvider } from '../../elements';
import { useFormControl } from '../../utils';
import { FormButtons } from '../UserProfile/FormButtons';
import { SuccessPage } from '../UserProfile/SuccessPage';
import { ContentPage } from './OrganizationContentPage';

export const InviteMemberPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Invite member';
  const subtitle = 'Invite new members to this organization';
  const card = useCardState();
  const [avatarChanged, setAvatarChanged] = React.useState(false);

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const organizationName = useFormControl('emailAddress', '', {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Email address',
    placeholder: '',
  });

  const role = useFormControl('role', '', {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Role',
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

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <Form.Root onSubmit={onSubmit}>
          <Form.ControlRow>
            <Form.Control
              sx={{ flexBasis: '80%' }}
              {...organizationName.props}
              required
            />
            <Select
              options={['admin', 'basic_member']}
              value={'admin'}
              onChange={() => {}}
            >
              <SelectButton />
              <SelectOptionList />
            </Select>
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage>
      <SuccessPage
        title={title}
        // text={localizationKeys('userProfile.profilePage.successMessage')}
        text={'Invitations successfully sent'}
      />
    </Wizard>
  );
});
