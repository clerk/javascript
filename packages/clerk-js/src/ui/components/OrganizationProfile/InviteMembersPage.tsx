import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { Flex, Text } from '../../customizables';
import {
  Alert,
  Form,
  Select,
  SelectButton,
  SelectOptionList,
  TagInput,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useFormControl } from '../../utils';
import { FormButtons } from '../UserProfile/FormButtons';
import { SuccessPage } from '../UserProfile/SuccessPage';
import { ContentPage } from './OrganizationContentPage';

export const InviteMembersPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Invite members';
  const subtitle = 'Invite new members to this organization';
  const card = useCardState();
  const { organization } = useCoreOrganization();

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const emailAddressField = useFormControl('emailAddress', `nikos+${Date.now()}@clerk.dev`, {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Email addresses',
    placeholder: '',
  });

  const roleField = useFormControl('role', 'basic_member', {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Role',
    placeholder: '',
  });

  const dataChanged = 'placeholder' !== emailAddressField.value;
  const canSubmit = dataChanged;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return organization
      .inviteMember({ emailAddress: emailAddressField.value, role: roleField.value })
      .then(wizard.nextStep);

    // return (
    // dataChanged
    //   ? user.update({ firstName: emailAddress.value, lastName: lastNameField.value })
    // : Promise.resolve()
    // )
    //   .then(() => {
    //     wizard.nextStep();
    //   })
    // .catch(err => {
    //   handleError(err, [emailAddress, lastNameField], card.setError);
    // });
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <Alert
          variant='danger'
          align='start'
          title={'The invitations could not be send. Fix the following and try again:'}
          subtitle={'nikos@clerk.dev, nikos@clerk.dev, nikos@clerk.dev, nikos@clerk.dev'}
          sx={{ border: 0 }}
        />

        <Form.Root onSubmit={onSubmit}>
          <Form.ControlRow>
            <Flex
              direction='col'
              gap={2}
              sx={{ width: '100%' }}
            >
              <Text>Email addresses</Text>
              <TagInput
                placeholder='Enter one or more email addresses, separated by spaces or commas'
                sx={{ width: '100%' }}
              />
            </Flex>
          </Form.ControlRow>
          <Form.ControlRow>
            <Flex
              direction='col'
              gap={2}
            >
              <Text>Role</Text>
              <Select
                options={['admin', 'basic_member']}
                value={'admin'}
                onChange={() => {}}
              >
                <SelectButton />
                <SelectOptionList />
              </Select>
            </Flex>
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
