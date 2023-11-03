import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError, MembershipRole } from '@clerk/types';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { useCoreOrganization } from '../../contexts';
import { Flex, Text } from '../../customizables';
import { Form, FormButtonContainer, TagInput, useCardState } from '../../elements';
import { useFetchRoles } from '../../hooks/useFetchRoles';
import type { LocalizationKey } from '../../localization';
import { localizationKeys, useLocalizations } from '../../localization';
import { useRouter } from '../../router';
import { createListFormat, handleError, useFormControl } from '../../utils';
import { RoleSelect } from './MemberListTable';

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

type InviteMembersFormProps = {
  onSuccess: () => void;
  onReset?: () => void;
  primaryButtonLabel?: LocalizationKey;
  resetButtonLabel?: LocalizationKey;
};

export const InviteMembersForm = (props: InviteMembersFormProps) => {
  const { navigate } = useRouter();
  const { onSuccess, onReset = () => navigate('..'), resetButtonLabel } = props;
  const { organization } = useCoreOrganization();
  const card = useCardState();
  const { t, locale } = useLocalizations();
  const [isValidUnsubmittedEmail, setIsValidUnsubmittedEmail] = useState(false);

  if (!organization) {
    return null;
  }

  const validateUnsubmittedEmail = (value: string) => setIsValidUnsubmittedEmail(isEmail(value));

  const emailAddressField = useFormControl('emailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__emailAddresses'),
  });

  const {
    props: {
      setError,
      setWarning,
      setSuccess,
      setInfo,
      isFocused,
      validatePassword,
      setHasPassedComplexity,
      hasPassedComplexity,
      feedback,
      feedbackType,
      clearFeedback,
      ...restEmailAddressProps
    },
  } = emailAddressField;

  const canSubmit = !!emailAddressField.value.length || isValidUnsubmittedEmail;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submittedData = new FormData(e.currentTarget);
    return organization
      .inviteMembers({
        emailAddresses: emailAddressField.value.split(','),
        role: submittedData.get('role') as MembershipRole,
      })
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
      <AsyncRoleSelect />
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

const AsyncRoleSelect = () => {
  const { options, isLoading } = useFetchRoles();
  const roleField = useFormControl('role', '', {
    label: localizationKeys('formFieldLabel__role'),
  });

  return (
    <Form.ControlRow elementId={roleField.id}>
      <Flex
        direction='col'
        gap={2}
      >
        <Text localizationKey={roleField.label} />
        <RoleSelect
          {...roleField.props}
          roles={options}
          isDisabled={isLoading}
          onChange={value => roleField.setValue(value)}
          triggerSx={t => ({ width: t.sizes.$48, justifyContent: 'space-between', display: 'flex' })}
          optionListSx={t => ({ minWidth: t.sizes.$48 })}
        />
      </Flex>
    </Form.ControlRow>
  );
};
