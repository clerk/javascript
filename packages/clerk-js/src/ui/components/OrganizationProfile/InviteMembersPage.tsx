import { MembershipRole } from '@clerk/types';
import React from 'react';

import { ClerkAPIResponseError } from '../../../core/resources/Error';
import { useWizard, Wizard } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { Flex, localizationKeys, Text } from '../../customizables';
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
import { handleError, useFormControl } from '../../utils';
import { FormButtons } from '../UserProfile/FormButtons';
import { SuccessPage } from '../UserProfile/SuccessPage';
import { ContentPage } from './OrganizationContentPage';

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

export const InviteMembersPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Invite members';
  const subtitle = 'Invite new members to this organization';
  const card = useCardState();
  const { organization } = useCoreOrganization();
  const [invalidEmails, setInvalidEmails] = React.useState<string[]>([]);

  if (!organization) {
    return null;
  }

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const emailAddressField = useFormControl('emailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__emailAddresses'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddresses'),
  });

  const roleField = useFormControl('role', 'basic_member', {
    type: 'text',
    // label: localizationKeys('formFieldLabel__firstName'),
    // placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    label: 'Role',
    placeholder: '',
  });

  React.useEffect(() => {
    // Remove invalid emails from the tag input
    if (invalidEmails.length) {
      const invalids = new Set(invalidEmails);
      const emails = emailAddressField.value.split(',');
      emailAddressField.setValue(emails.filter(e => !invalids.has(e)).join(','));
    }
  }, [invalidEmails]);

  const canSubmit = !!emailAddressField.value.length;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return organization
      .inviteMembers({ emailAddresses: emailAddressField.value.split(','), role: roleField.value as MembershipRole })
      .then(wizard.nextStep)
      .catch(err => {
        if (err instanceof ClerkAPIResponseError) {
          const invalids = err.errors[0].meta?.emailAddresses || [];
          if (invalids.length) {
            setInvalidEmails(invalids);
          } else {
            setInvalidEmails([]);
            handleError(err, [], card.setError);
          }
        }
      });
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        {!!invalidEmails.length && (
          <Alert
            variant='danger'
            align='start'
            title={'The invitations could not be send. Fix the following and try again:'}
            subtitle={invalidEmails.join(', ')}
            sx={{ border: 0 }}
          />
        )}

        <Form.Root onSubmit={onSubmit}>
          <Form.ControlRow>
            <Flex
              direction='col'
              gap={2}
              sx={{ width: '100%' }}
            >
              <Text>Email addresses</Text>
              <TagInput
                {...emailAddressField.props}
                validate={isEmail}
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
                onChange={option => {}}
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
