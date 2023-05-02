import type { MembershipRole, OrganizationResource } from '@clerk/types';
import React from 'react';

import { ClerkAPIResponseError } from '../../../core/resources/Error';
import { Flex, Text } from '../../customizables';
import {
  Alert,
  Form,
  FormButtonContainer,
  Select,
  SelectButton,
  SelectOptionList,
  TagInput,
  useCardState,
} from '../../elements';
import { useNavigate } from '../../hooks';
import type { LocalizationKey } from '../../localization';
import { localizationKeys, useLocalizations } from '../../localization';
import { handleError, roleLocalizationKey, useFormControl } from '../../utils';

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

type InviteMembersFormProps = {
  organization: OrganizationResource;
  onSuccess: () => void;
  onReset?: () => void;
  primaryButtonLabel?: LocalizationKey;
  resetButtonLabel?: LocalizationKey;
};

export const InviteMembersForm = (props: InviteMembersFormProps) => {
  const { navigate } = useNavigate();
  const { onSuccess, onReset = () => navigate('..'), resetButtonLabel, organization } = props;
  const card = useCardState();
  const { t } = useLocalizations();

  const [invalidEmails, setInvalidEmails] = React.useState<string[]>([]);

  if (!organization) {
    return null;
  }

  const roles: Array<{ label: string; value: MembershipRole }> = [
    { label: t(roleLocalizationKey('admin')), value: 'admin' },
    { label: t(roleLocalizationKey('basic_member')), value: 'basic_member' },
    // { label: t(roleLocalizationKey('guest_member')), value: 'guest_member' },
  ];

  const emailAddressField = useFormControl('emailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__emailAddresses'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddresses'),
  });

  const {
    props: { errorText, hasLostFocus, setError, isSuccessful, setSuccessful, ...restEmailAddressProps },
  } = emailAddressField;

  const roleField = useFormControl('role', 'basic_member', {
    options: roles,
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
      .then(onSuccess)
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
    <>
      {!!invalidEmails.length && (
        <Alert
          variant='danger'
          align='start'
          title={localizationKeys('organizationProfile.invitePage.detailsTitle__inviteFailed')}
          subtitle={invalidEmails.join(', ')}
          sx={{ border: 0 }}
        />
      )}

      <Form.Root onSubmit={onSubmit}>
        <Form.ControlRow elementId={emailAddressField.id}>
          <Flex
            direction='col'
            gap={2}
            sx={{ width: '100%' }}
          >
            <Text localizationKey={localizationKeys('formFieldLabel__emailAddresses')} />
            <TagInput
              {...restEmailAddressProps}
              autoFocus
              validate={isEmail}
              sx={{ width: '100%' }}
            />
          </Flex>
        </Form.ControlRow>
        <Form.ControlRow elementId={roleField.id}>
          <Flex
            direction='col'
            gap={2}
          >
            <Text localizationKey={localizationKeys('formFieldLabel__role')} />
            {/*// @ts-expect-error */}
            <Select
              {...roleField.props}
              onChange={option => roleField.setValue(option.value)}
            >
              <SelectButton sx={t => ({ width: t.sizes.$48, justifyContent: 'space-between', display: 'flex' })}>
                {roleField.props.options?.find(o => o.value === roleField.value)?.label}
              </SelectButton>
              <SelectOptionList sx={t => ({ minWidth: t.sizes.$48 })} />
            </Select>
          </Flex>
        </Form.ControlRow>
        <FormButtonContainer>
          <Form.SubmitButton
            block={false}
            isDisabled={!canSubmit}
            localizationKey={localizationKeys('organizationProfile.invitePage.formButtonPrimary__continue')}
          />
          <Form.ResetButton
            localizationKey={resetButtonLabel || localizationKeys('userProfile.formButtonReset')}
            block={false}
            onClick={onReset}
          />
        </FormButtonContainer>
      </Form.Root>
    </>
  );
};
