import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useOrganization } from '@clerk/shared/react';
import type { ClerkAPIError } from '@clerk/types';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Flex } from '../../customizables';
import { Form, FormButtonContainer, TagInput, useCardState } from '../../elements';
import { useFetchRoles } from '../../hooks/useFetchRoles';
import type { LocalizationKey } from '../../localization';
import { localizationKeys, useLocalizations } from '../../localization';
import { mqu } from '../../styledSystem';
import { createListFormat, handleError, useFormControl } from '../../utils';
import { RoleSelect } from './MemberListTable';

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

type InviteMembersFormProps = {
  onSuccess?: () => void;
  onReset?: () => void;
  primaryButtonLabel?: LocalizationKey;
  resetButtonLabel?: LocalizationKey;
};

export const InviteMembersForm = (props: InviteMembersFormProps) => {
  const { onSuccess, onReset, resetButtonLabel } = props;
  const { organization, invitations } = useOrganization({
    invitations: {
      pageSize: 10,
      keepPreviousData: true,
    },
  });
  const card = useCardState();
  const { t, locale } = useLocalizations();
  const [isValidUnsubmittedEmail, setIsValidUnsubmittedEmail] = useState(false);

  const validateUnsubmittedEmail = (value: string) => setIsValidUnsubmittedEmail(isEmail(value));

  const emailAddressField = useFormControl('emailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__emailAddresses'),
  });

  const roleField = useFormControl('role', '', {
    label: localizationKeys('formFieldLabel__role'),
  });

  if (!organization) {
    return null;
  }

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

  const canSubmit = (!!emailAddressField.value.length || isValidUnsubmittedEmail) && !!roleField.value;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submittedData = new FormData(e.currentTarget);
    return organization
      .inviteMembers({
        emailAddresses: emailAddressField.value.split(','),
        role: submittedData.get('role') as string,
      })
      .then(async () => {
        await invitations?.revalidate?.();
        return onSuccess?.();
      })
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
        <TagInput
          {...restEmailAddressProps}
          autoFocus
          validate={isEmail}
          sx={{ width: '100%' }}
          validateUnsubmittedEmail={validateUnsubmittedEmail}
          placeholder={localizationKeys('formFieldInputPlaceholder__emailAddresses')}
        />
      </Form.ControlRow>
      <Flex
        align='center'
        justify='between'
        sx={t => ({
          marginTop: t.space.$2,
          [mqu.sm]: { flexDirection: 'column', gap: t.space.$4 },
        })}
      >
        <AsyncRoleSelect {...roleField} />
        <FormButtonContainer sx={t => ({ margin: t.space.$none })}>
          <Form.SubmitButton
            block={false}
            hasArrow={false}
            isDisabled={!canSubmit}
            localizationKey={localizationKeys('organizationProfile.invitePage.formButtonPrimary__continue')}
          />
          <Form.ResetButton
            localizationKey={resetButtonLabel || localizationKeys('userProfile.formButtonReset')}
            block={false}
            onClick={onReset}
          />
        </FormButtonContainer>
      </Flex>
    </Form.Root>
  );
};

const AsyncRoleSelect = (field: ReturnType<typeof useFormControl<'role'>>) => {
  const { options, isLoading } = useFetchRoles();

  return (
    <Form.ControlRow elementId={field.id}>
      <Flex
        direction='col'
        gap={2}
      >
        <RoleSelect
          {...field.props}
          roles={options}
          isDisabled={isLoading}
          onChange={value => field.setValue(value)}
          triggerSx={t => ({ width: t.sizes.$40, justifyContent: 'space-between', display: 'flex' })}
          optionListSx={t => ({ minWidth: t.sizes.$48 })}
        />
      </Flex>
    </Form.ControlRow>
  );
};
