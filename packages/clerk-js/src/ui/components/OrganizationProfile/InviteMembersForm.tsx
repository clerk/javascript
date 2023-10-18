import { isClerkAPIResponseError } from '@clerk/shared';
import type { ClerkAPIError, MembershipRole, OrganizationResource } from '@clerk/types';
import React from 'react';

import { Flex, Text } from '../../customizables';
import {
  Form,
  FormButtonContainer,
  Select,
  SelectButton,
  SelectOptionList,
  TagInput,
  useCardState,
} from '../../elements';
import type { LocalizationKey } from '../../localization';
import { localizationKeys, useLocalizations } from '../../localization';
import { useRouter } from '../../router';
import { createListFormat, handleError, roleLocalizationKey, useFormControl } from '../../utils';

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

type InviteMembersFormProps = {
  organization: OrganizationResource;
  onSuccess: () => void;
  onReset?: () => void;
  primaryButtonLabel?: LocalizationKey;
  resetButtonLabel?: LocalizationKey;
};

export const InviteMembersForm = (props: InviteMembersFormProps) => {
  const { navigate } = useRouter();
  const { onSuccess, onReset = () => navigate('..'), resetButtonLabel, organization } = props;
  const card = useCardState();
  const { t, locale } = useLocalizations();
  const [isValidUnsubmittedEmail, setIsValidUnsubmittedEmail] = React.useState(false);

  if (!organization) {
    return null;
  }

  const validateUnsubmittedEmail = (value: string) => setIsValidUnsubmittedEmail(isEmail(value));

  const roles: Array<{ label: string; value: MembershipRole }> = [
    { label: t(roleLocalizationKey('admin')), value: 'admin' },
    { label: t(roleLocalizationKey('basic_member')), value: 'basic_member' },
  ];

  const emailAddressField = useFormControl('emailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__emailAddresses'),
  });

  const {
    props: {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      enableErrorAfterBlur,
      errorText,
      hasLostFocus,
      isFocused,
      setError,
      setWarning,
      setSuccessful,
      successfulText,
      warningText,
      validatePassword,
      setHasPassedComplexity,
      hasPassedComplexity,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...restEmailAddressProps
    },
  } = emailAddressField;

  const roleField = useFormControl('role', 'basic_member', {
    options: roles,
    label: localizationKeys('formFieldLabel__role'),
    placeholder: '',
  });

  const canSubmit = !!emailAddressField.value.length || isValidUnsubmittedEmail;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return organization
      .inviteMembers({ emailAddresses: emailAddressField.value.split(','), role: roleField.value as MembershipRole })
      .then(onSuccess)
      .catch(err => {
        if (isClerkAPIResponseError(err)) {
          removeInvalidEmails(err.errors[0]);
        }

        if (isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'duplicate_record') {
          const unlocalizedEmailsList = err.errors[0].meta?.emailAddresses || [];
          card.setError(
            t(
              localizationKeys('organizationProfile.invitePage.detailsTitle__inviteFailed', {
                // Create a localized list of email addresses
                email_addresses: createListFormat(unlocalizedEmailsList, locale),
              }),
            ),
          );
        } else {
          handleError(err, [], card.setError);
        }
      });
  };

  const removeInvalidEmails = (err: ClerkAPIError) => {
    const invalidEmails = new Set([...(err.meta?.emailAddresses ?? []), ...(err.meta?.identifiers ?? [])]);
    const emails = emailAddressField.value.split(',');
    emailAddressField.setValue(emails.filter(e => !invalidEmails.has(e)).join(','));
  };

  return (
    <Form.Root onSubmit={onSubmit}>
      <Form.ControlRow elementId={emailAddressField.id}>
        <Flex
          direction='col'
          gap={2}
          sx={{ width: '100%' }}
        >
          <Text localizationKey={localizationKeys('formFieldLabel__emailAddresses')} />

          <Text
            localizationKey={localizationKeys('formFieldInputPlaceholder__emailAddresses')}
            colorScheme='neutral'
            sx={t => ({ fontSize: t.fontSizes.$xs })}
          />

          <TagInput
            {...restEmailAddressProps}
            autoFocus
            validate={isEmail}
            sx={{ width: '100%' }}
            validateUnsubmittedEmail={validateUnsubmittedEmail}
          />
        </Flex>
      </Form.ControlRow>
      <Form.ControlRow elementId={roleField.id}>
        <Flex
          direction='col'
          gap={2}
        >
          <Text localizationKey={roleField.label} />
          {/*@ts-expect-error  Select expects options to be an array but useFormControl returns an optional field. */}
          <Select
            elementId='role'
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
  );
};
