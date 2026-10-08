import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { isEmail } from '@/ui/utils/emailUtils';
import { handleError } from '@/ui/utils/errorHandler';
import { getClosestProfileScrollBoxFromElement } from '@/ui/utils/getClosestProfileScrollBox';
import { createListFormat } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys, useLocalizations } from '../../localization';
import type { InviteMembersParams, useInviteMembersFormModel } from './invite-members-form.model';
import { classifyInviteMembersError } from './invite-members-form.utils';

export const useInviteMembersFormController = (model: ReturnType<typeof useInviteMembersFormModel>) => {
  const card = useCardState();
  const { t, locale } = useLocalizations();
  const [isValidUnsubmittedEmail, setIsValidUnsubmittedEmail] = useState(false);
  const emailAddressField = useFormControl('emailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__emailAddresses'),
  });
  const roleField = useFormControl('role', '', {
    label: localizationKeys('formFieldLabel__role'),
  });

  useEffect(() => {
    if (roleField.value || !model.defaultRole) {
      return;
    }

    const defaultRoleExists = model.roles?.some(option => option.value === model.defaultRole);
    if (defaultRoleExists) {
      roleField.setValue(model.defaultRole);
    }
  }, [model.defaultRole, model.roles, roleField]);

  const canSubmit = (!!emailAddressField.value.length || isValidUnsubmittedEmail) && !!roleField.value;
  const emailAddresses = emailAddressField.value.split(',');

  const latest = useRef({ model, card, t, locale, emailAddressField, roleField, canSubmit });
  latest.current = { model, card, t, locale, emailAddressField, roleField, canSubmit };
  const mounted = useRef(true);
  const flow = useRef<object>();
  const pending = useRef<Promise<void>>();
  const retry = useRef<{ owner: object; params: InviteMembersParams }>();
  const releaseRequest = useRef<() => void>();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      flow.current = undefined;
      pending.current = undefined;
      retry.current = undefined;
      releaseRequest.current?.();
      releaseRequest.current = undefined;
    };
  }, []);
  const ownsFlow = (owner: object) => mounted.current && flow.current === owner && latest.current.model.canRun();

  const inviteMembersAfterCheckout = (owner: object) => {
    if (!ownsFlow(owner) || pending.current || retry.current?.owner !== owner) {
      return;
    }
    const release = latest.current.card.beginRequest();
    if (!release) {
      return;
    }
    const params = retry.current.params;
    retry.current = undefined;
    releaseRequest.current = release;
    latest.current.card.setError(undefined);
    const action = Promise.resolve()
      .then(async () => {
        if (!ownsFlow(owner)) {
          return;
        }
        try {
          await latest.current.model.inviteMembers(params, () => ownsFlow(owner));
        } catch (error) {
          if (ownsFlow(owner)) {
            await handleInviteMembersError(error, params, owner, { openCheckoutOnInsufficientSeats: false });
          }
        }
      })
      .finally(() => {
        if (pending.current === action) {
          pending.current = undefined;
          releaseRequest.current = undefined;
        }
        release();
      });
    pending.current = action;
    return action;
  };

  const onSubscriptionComplete = (owner: object) => {
    if (!ownsFlow(owner) || retry.current?.owner !== owner) {
      return;
    }
    const activeRequest = pending.current;
    if (activeRequest) {
      void activeRequest.then(
        () => inviteMembersAfterCheckout(owner),
        () => {},
      );
    } else {
      void inviteMembersAfterCheckout(owner);
    }
  };

  const handleInviteMembersError = async (
    error: unknown,
    params: InviteMembersParams,
    owner: object,
    {
      openCheckoutOnInsufficientSeats = true,
      portalRoot,
    }: { openCheckoutOnInsufficientSeats?: boolean; portalRoot?: HTMLElement | null } = {},
  ) => {
    if (!ownsFlow(owner)) {
      return;
    }
    const { card, t, locale, emailAddressField, model } = latest.current;
    const classified = classifyInviteMembersError(error);
    if (classified.kind === 'other') {
      if (error instanceof Error) {
        handleError(error, [], card.setError);
        return;
      }

      throw error;
    }

    const invalidEmails = new Set(classified.invalidEmails);
    emailAddressField.setValue(params.emailAddresses.filter(email => !invalidEmails.has(email)).join(','));

    switch (classified.code) {
      case 'duplicate_record': {
        card.setError(
          t(
            localizationKeys('organizationProfile.invitePage.detailsTitle__inviteFailed', {
              email_addresses: createListFormat(classified.duplicateEmails, locale),
            }),
          ),
        );
        break;
      }
      case 'already_a_member_in_organization': {
        handleError(classified.error, [], message =>
          classified.memberEmail
            ? card.setError(
                t(
                  localizationKeys('unstable__errors.already_a_member_in_organization', {
                    email: classified.memberEmail,
                  }),
                ),
              )
            : card.setError(message),
        );
        break;
      }
      case 'insufficient_seats': {
        if (!openCheckoutOnInsufficientSeats) {
          handleError(classified.error, [], () =>
            card.setError(t(localizationKeys('unstable__errors.insufficient_seats_change_plan'))),
          );
          break;
        }

        try {
          retry.current = { owner, params: { emailAddresses: [...params.emailAddresses], role: params.role } };
          const result = await model.openSeatCheckout(
            classified.seatsQuantity,
            portalRoot,
            () => onSubscriptionComplete(owner),
            () => ownsFlow(owner),
          );
          if (!ownsFlow(owner)) {
            return;
          }
          if (result === 'checkout') {
            return 'checkout' as const;
          }

          retry.current = undefined;
          handleError(classified.error, [], () =>
            card.setError(
              t(
                localizationKeys(
                  result === 'contact-support'
                    ? 'unstable__errors.insufficient_seats_contact_support'
                    : 'unstable__errors.insufficient_seats_change_plan',
                ),
              ),
            ),
          );
        } catch (checkoutError) {
          if (!ownsFlow(owner)) {
            return;
          }
          retry.current = undefined;
          if (checkoutError instanceof Error) {
            handleError(checkoutError, [], () =>
              card.setError(t(localizationKeys('unstable__errors.insufficient_seats_contact_support'))),
            );
          }
        }
        break;
      }
      default: {
        handleError(classified.error, [], card.setError);
      }
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mounted.current || !latest.current.model.canRun()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    if (!latest.current.canSubmit) {
      return Promise.resolve();
    }
    const submittedData = new FormData(event.currentTarget);
    const portalRoot = getClosestProfileScrollBoxFromElement(event.currentTarget);
    const params: InviteMembersParams = {
      emailAddresses: latest.current.emailAddressField.value.split(','),
      role: submittedData.get('role') as string,
    };
    const owner = {};
    flow.current = owner;
    retry.current = undefined;
    latest.current.card.setError(undefined);
    const action = Promise.resolve()
      .then(async () => {
        if (!ownsFlow(owner)) {
          return;
        }
        if (window.location.pathname === '/open-invite-members') {
          await latest.current.model.openSandboxCheckout(params, portalRoot, () => ownsFlow(owner));
          return;
        }
        try {
          await latest.current.model.inviteMembers(params, () => ownsFlow(owner));
        } catch (error) {
          if (ownsFlow(owner)) {
            await handleInviteMembersError(error, params, owner, { portalRoot });
          }
        }
      })
      .finally(() => {
        if (pending.current === action) {
          pending.current = undefined;
        }
      });
    pending.current = action;
    return action;
  };

  return {
    emailAddressField,
    roleField,
    error: card.error,
    roles: model.roles,
    isRoleDisabled: model.isRoleLoading || model.hasRoleSetMigration || card.isLoading,
    canSubmit: canSubmit && !card.isLoading,
    isPerSeatCostPlan: model.isPerSeatCostPlan,
    mustPurchaseSeats: model.mustPurchaseSeats(emailAddresses.length),
    onSubmit,
    validateUnsubmittedEmail: (value: string) => setIsValidUnsubmittedEmail(isEmail(value)),
    rolePrefix: `${t(localizationKeys('formFieldLabel__role'))}:`,
  };
};
