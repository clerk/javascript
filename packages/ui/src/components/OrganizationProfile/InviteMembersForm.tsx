import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization } from '@clerk/shared/react';
import type { ClerkAPIError } from '@clerk/shared/types';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { TagInput } from '@/ui/elements/TagInput';
import {
  getPaidSeatsUnitTier,
  getSeatUnitPrice,
  organizationAndInvitationsExceedsPurchasedSeats,
} from '@/ui/utils/billingPlanSeats';
import { handleError } from '@/ui/utils/errorHandler';
import { getClosestProfileScrollBoxFromElement } from '@/ui/utils/getClosestProfileScrollBox';
import { createListFormat } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useEnvironment, usePlansContext, useSubscription } from '../../contexts';
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
  const clerk = useClerk();
  const { organization, invitations } = useOrganization({
    invitations: {
      pageSize: 10,
      keepPreviousData: true,
    },
  });
  const { data: subscription, subscriptionItems } = useSubscription();
  const activeSubscriptionItem = subscription?.subscriptionItems.find(si => si.status === 'active');
  const { handleSelectPlan } = usePlansContext();
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
  const emailAddresses = emailAddressField.value.split(',');

  const seatUnitPrice = activeSubscriptionItem ? getSeatUnitPrice(activeSubscriptionItem.plan) : null;
  const paidSeatsTier = seatUnitPrice ? getPaidSeatsUnitTier(seatUnitPrice) : null;
  const isPerSeatCostPlan = !!paidSeatsTier;
  const mustPurchaseSeats =
    isPerSeatCostPlan &&
    organizationAndInvitationsExceedsPurchasedSeats(activeSubscriptionItem, organization, emailAddresses.length);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    const submittedData = new FormData(e.currentTarget);
    const portalRoot = getClosestProfileScrollBoxFromElement(e.currentTarget);
    try {
      await organization.inviteMembers({
        emailAddresses: emailAddressField.value.split(','),
        role: submittedData.get('role') as string,
      });

      await invitations?.revalidate?.();
      onSuccess?.();
    } catch (err) {
      if (!isClerkAPIResponseError(err)) {
        if (err instanceof Error) {
          handleError(err, [], card.setError);
          return;
        }

        throw err;
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
        case 'insufficient_seats': {
          try {
            const { data: plans } = await clerk.billing.getPlans({
              for: 'organization',
              org_id: organization.id,
              min_seats: err.errors[0].meta?.seatsQuantity,
            });

            if (plans.length === 0) {
              handleError(err, [], () =>
                card.setError(t(localizationKeys('unstable__errors.insufficient_seats_contact_support'))),
              );
              break;
            }

            const activeSubscriptionItem = subscriptionItems.find(si => si.status === 'active');
            if (activeSubscriptionItem) {
              const currentPlan = activeSubscriptionItem.plan;
              const currentPlanAndPriceSupportsDesiredSeatQuantity = plans.some(
                p =>
                  p.id === currentPlan.id &&
                  p.availablePrices?.some(price => price.id === activeSubscriptionItem.priceId),
              );
              if (currentPlanAndPriceSupportsDesiredSeatQuantity) {
                handleSelectPlan({
                  mode: 'modal',
                  plan: currentPlan,
                  planPeriod: activeSubscriptionItem.planPeriod,
                  seatsQuantity: err.errors[0].meta?.seatsQuantity,
                  portalRoot,
                });
                break;
              }
            }

            handleError(err, [], () =>
              card.setError(t(localizationKeys('unstable__errors.insufficient_seats_change_plan'))),
            );
            break;
          } catch (err: unknown) {
            if (err instanceof Error) {
              handleError(err, [], () =>
                card.setError(t(localizationKeys('unstable__errors.insufficient_seats_contact_support'))),
              );
            }
            break;
          }
        }
        default: {
          handleError(err, [], card.setError);
        }
      }
    }
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
            localizationKey={
              isPerSeatCostPlan && mustPurchaseSeats
                ? localizationKeys('organizationProfile.invitePage.formButtonPrimary__purchaseSeats')
                : localizationKeys('organizationProfile.invitePage.formButtonPrimary__continue')
            }
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

    // Skip if the default role from org settings is not in the current role set
    // This will eventually be returned by the roles endpoint, and `organizationSettings.domains.defaultRole` will be deprecated
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
