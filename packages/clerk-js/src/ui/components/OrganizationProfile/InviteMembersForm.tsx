import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useOrganization } from '@clerk/shared/react';
import type { ClerkAPIError } from '@clerk/shared/types';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { TagInput } from '@/ui/elements/TagInput';
import { handleError } from '@/ui/utils/errorHandler';
import { createListFormat } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useEnvironment } from '../../contexts';
import { Flex } from '../../customizables';
import { useFetchRoles } from '../../hooks/useFetchRoles';
import type { LocalizationKey } from '../../localization';
import { localizationKeys, useLocalizations } from '../../localization';
import { mqu } from '../../styledSystem';
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
    if (!canSubmit) {
      return;
    }

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
        if (!isClerkAPIResponseError(err)) {
          handleError(err, [], card.setError);
          return;
        }

        removeInvalidEmails(err.errors[0]);

        switch (err.errors?.[0]?.code) {
          case 'duplicate_record': {
            const unlocalizedEmailsList = err.errors[0].meta?.emailAddresses || [];
            card.setError(
              t(
                localizationKeys('organizationProfile.invitePage.detailsTitle__inviteFailed', {
                  // Create a localized list of email addresses
                  email_addresses: createListFormat(unlocalizedEmailsList, locale),
                }),
              ),
            );
            break;
          }
          case 'already_a_member_in_organization': {
            /**
             * Extracts email from the error message since it's not provided in the error response
             */
            const longMessage = err.errors[0].longMessage ?? '';
            const email = longMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)?.[0];

            handleError(err, [], err =>
              email
                ? /**
                   * Fallbacks to original error message in case the email cannot be extracted
                   */
                  card.setError(
                    t(
                      localizationKeys('unstable__errors.already_a_member_in_organization', {
                        email,
                      }),
                    ),
                  )
                : card.setError(err),
            );

            break;
          }
          default: {
            handleError(err, [], card.setError);
          }
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
          gap: t.space.$4,
          flexWrap: 'wrap',
          [mqu.sm]: { justifyContent: 'center' },
        })}
      >
        <AsyncRoleSelect {...roleField} />
        <FormButtonContainer sx={t => ({ margin: t.space.$none, flexWrap: 'wrap', justifyContent: 'center' })}>
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
      </Flex>
    </Form.Root>
  );
};

const AsyncRoleSelect = (field: ReturnType<typeof useFormControl<'role'>>) => {
  const { options, isLoading, hasRoleSetMigration } = useFetchRoles();
  const { t } = useLocalizations();
  const defaultRole = useDefaultRole();

  useEffect(() => {
    if (field.value || !defaultRole) {
      return;
    }

    const defaultRoleExists = options?.some(option => option.value === defaultRole);
    if (!defaultRoleExists) {
      return;
    }

    field.setValue(defaultRole);
  }, [defaultRole, options, field]);

  return (
    <Form.ControlRow elementId={field.id}>
      <Flex
        direction='col'
        gap={2}
      >
        <RoleSelect
          {...field.props}
          roles={options}
          isDisabled={isLoading || hasRoleSetMigration}
          onChange={value => field.setValue(value)}
          triggerSx={t => ({ minWidth: t.sizes.$40, justifyContent: 'space-between', display: 'flex' })}
          optionListSx={t => ({ minWidth: t.sizes.$48 })}
          prefixLocalizationKey={`${t(localizationKeys('formFieldLabel__role'))}:`}
        />
      </Flex>
    </Form.ControlRow>
  );
};

/**
 * Determines default Role from the Organization settings or fallback to
 * the only available Role.
 */
const useDefaultRole = () => {
  const { options } = useFetchRoles();
  const { organizationSettings } = useEnvironment();

  let defaultRole = organizationSettings.domains.defaultRole;

  if (!defaultRole && options?.length === 1) {
    defaultRole = options[0].value;
  }

  return defaultRole;
};
