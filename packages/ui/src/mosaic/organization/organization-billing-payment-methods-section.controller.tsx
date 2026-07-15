import { __internal_useOrganizationBase, useReverification, useSession } from '@clerk/shared/react';
import type { BillingPaymentMethodResource } from '@clerk/shared/types';

import { usePaymentMethods, useSubscriberTypeContext } from '@/contexts';

import { useMachine } from '../machine/useMachine';
import type { PaymentMethodRemoveState, PaymentMethodRow } from './organization-billing-payment-methods-section.view';
import { organizationBillingPaymentMethodsMakeDefaultMachine } from './organization-billing-payment-methods-section-make-default.machine';
import { organizationBillingPaymentMethodsRemoveMachine } from './organization-billing-payment-methods-section-remove.machine';

type OrganizationBillingPaymentMethodsSectionController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      title: string;
      rows: PaymentMethodRow[];
      makeDefaultPendingId: string | null;
      makeDefaultError: string | null;
      onMakeDefault: (id: string) => void;
      onRemove: (row: PaymentMethodRow) => void;
      remove: PaymentMethodRemoveState;
    };

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Mirrors the legacy PaymentMethodRow: card methods show their brand + tail, others show the raw
// payment type. The confirmation `label` keeps the legacy lowercase form used by RemoveResourceForm.
function toRow(method: BillingPaymentMethodResource): PaymentMethodRow {
  const isCard = method.paymentType === 'card';
  const typeSource = (isCard ? method.cardType : method.paymentType) ?? '';
  const detailLabel = isCard && method.last4 ? `⋯ ${method.last4}` : '';
  return {
    id: method.id,
    typeLabel: capitalize(typeSource),
    detailLabel,
    label: `${typeSource} ${isCard ? `⋯ ${method.last4}` : '-'}`,
    isDefault: method.isDefault ?? false,
    isExpired: method.status === 'expired',
    isRemovable: method.isRemovable ?? false,
  };
}

export function useOrganizationBillingPaymentMethodsSectionController(): OrganizationBillingPaymentMethodsSectionController {
  const { data, isLoading, revalidate } = usePaymentMethods();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const subscriberType = useSubscriberTypeContext();
  // Do not use `useOrganization` to avoid triggering the in-app enable organizations prompt in development instance
  const organization = __internal_useOrganizationBase();
  const orgId = subscriberType === 'organization' ? organization?.id : undefined;

  const findMethod = (paymentMethodId: string) => data.find(method => method.id === paymentMethodId);

  // Removing a payment method can require step-up auth; route it through reverification to match the
  // legacy RemoveResourceForm. make-default is intentionally not reverified (legacy did not either).
  const removeMethod = useReverification((method: BillingPaymentMethodResource) => method.remove({ orgId }));

  const [makeDefaultSnapshot, sendMakeDefault] = useMachine(organizationBillingPaymentMethodsMakeDefaultMachine, {
    context: {
      makeDefault: async ({ paymentMethodId }) => {
        await findMethod(paymentMethodId)?.makeDefault({ orgId });
        void revalidate();
      },
    },
  });

  const [removeSnapshot, sendRemove] = useMachine(organizationBillingPaymentMethodsRemoveMachine, {
    context: {
      removePaymentMethod: async ({ paymentMethodId }) => {
        const method = findMethod(paymentMethodId);
        if (!method) {
          return;
        }
        await removeMethod(method);
        void revalidate();
      },
    },
  });

  if (!isSessionLoaded) {
    return { status: 'loading' };
  }

  const canManage = session?.checkAuthorization({ permission: 'org:sys_billing:manage' }) ?? false;
  if (!canManage) {
    return { status: 'hidden' };
  }

  // Wait for the first page before deciding, so we do not flash empty then re-populate.
  if (isLoading && data.length === 0) {
    return { status: 'loading' };
  }

  // Without remotely-hosted components an empty section has nothing to offer (no add flow), so hide it.
  if (__BUILD_DISABLE_RHC__ && data.length === 0) {
    return { status: 'hidden' };
  }

  // Default method first, mirroring the legacy sort.
  const rows = [...data].sort((a, b) => (a.isDefault && !b.isDefault ? -1 : 1)).map(toRow);

  return {
    status: 'ready',
    title: 'Payment methods',
    rows,
    makeDefaultPendingId: makeDefaultSnapshot.context.pendingId || null,
    makeDefaultError: makeDefaultSnapshot.context.error,
    onMakeDefault: id => sendMakeDefault({ type: 'MAKE_DEFAULT', paymentMethodId: id }),
    onRemove: row => sendRemove({ type: 'OPEN', paymentMethod: { id: row.id, label: row.label } }),
    remove: {
      open: removeSnapshot.value === 'confirming' || removeSnapshot.value === 'removing',
      label: removeSnapshot.context.paymentMethodLabel,
      error: removeSnapshot.context.error,
      submitting: removeSnapshot.value === 'removing',
      onConfirm: () => sendRemove({ type: 'CONFIRM' }),
      onCancel: () => sendRemove({ type: 'CANCEL' }),
    },
  };
}
