import React from 'react';

import { useWizard, Wizard } from '../../common';
import { Text } from '../../customizables';
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
import { PropsOfComponent } from '../../styledSystem';
import { useFormControl } from '../../utils';
import { FormButtons } from '../UserProfile/FormButtons';
import { SuccessPage } from '../UserProfile/SuccessPage';
import { ContentPage } from './OrganizationContentPage';

export const InviteMembersPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Invite member';
  const subtitle = 'Invite new members to this organization';
  const card = useCardState();

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const organizationName = useFormControl('emailAddress', '', {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Email addresses',
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
  const canSubmit = dataChanged;

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
        <InviteAlert
          title={'The invitations could not be send. Fix the following and try again:'}
          subtitle={'invite3@example, invite4example.com'}
        />

        <Form.Root onSubmit={onSubmit}>
          <Form.ControlRow>
            {/* <Form.Control
              sx={{ flexBasis: '80%' }}
              {...organizationName.props}
              required
            /> */}
            <TagInput />
          </Form.ControlRow>
          <Form.ControlRow>
            <Select
              options={['admin', 'basic_member']}
              value={'admin'}
              onChange={() => {}}
            >
              {/* Pass value as child so that the defaultOptionBuilder is not used */}
              <SelectButton>admin</SelectButton>
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

type InviteAlertProps = PropsOfComponent<typeof Alert> & { title?: string; subtitle?: string };
const InviteAlert = (props: InviteAlertProps) => {
  const { title, subtitle } = props;
  return (
    <Alert
      variant='danger'
      align='start'
      sx={{ border: 0 }}
    >
      <Text>{title}</Text>
      <Text sx={t => ({ opacity: t.opacity.$inactive })}>{subtitle}</Text>
    </Alert>
  );
};
