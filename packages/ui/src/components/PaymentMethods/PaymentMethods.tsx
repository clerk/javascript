import { __internal_useOrganizationBase, useClerk } from '@clerk/shared/react';
import type { BillingPaymentMethodResource } from '@clerk/shared/types';
import { Fragment, useMemo, useRef } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';

import { RemoveResourceForm } from '../../common';
import { DevOnly } from '../../common/DevOnly';
import { usePaymentMethods, useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import * as AddPaymentMethod from './AddPaymentMethod';
import { PaymentMethodRow } from './PaymentMethodRow';
import { TestPaymentMethod } from './TestPaymentMethod';

const AddScreen = withCardStateProvider(({ onSuccess }: { onSuccess: () => void }) => {
  const { close } = useActionContext();
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  const onAddPaymentMethodSuccess = async (context: { gateway: 'stripe'; paymentToken: string }) => {
    const resource = subscriberType === 'organization' ? clerk?.organization : clerk.user;
    await resource?.addPaymentMethod(context);
    onSuccess();
    close();
    return Promise.resolve();
  };

  return (
    <AddPaymentMethod.Root
      onSuccess={onAddPaymentMethodSuccess}
      cancelAction={close}
    >
      <AddPaymentMethod.FormHeader
        text={localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.add`)}
      />
      <AddPaymentMethod.FormSubtitle
        text={localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.addSubtitle`)}
      />
      <DevOnly>
        <TestPaymentMethod />
      </DevOnly>
    </AddPaymentMethod.Root>
  );
});

const RemoveScreen = ({
  paymentMethod,
  revalidate,
}: {
  paymentMethod: BillingPaymentMethodResource;
  revalidate: () => void;
}) => {
  const { close } = useActionContext();
  const card = useCardState();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const ref = useRef(
    `${paymentMethod.paymentType === 'card' ? paymentMethod.cardType : paymentMethod.paymentType} ${paymentMethod.paymentType === 'card' ? `⋯ ${paymentMethod.last4}` : '-'}`,
  );
  // Do not use `useOrganization` to avoid triggering the in-app enable organizations prompt in development instance
  const organization = __internal_useOrganizationBase();

  if (!ref.current) {
    return null;
  }

  const removePaymentMethod = async () => {
    await paymentMethod
      .remove({ orgId: subscriberType === 'organization' ? organization?.id : undefined })
      .then(revalidate)
      .catch((error: any) => {
        handleError(error, [], card.setError);
      });
  };

  return (
    <RemoveResourceForm
      title={localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.removeMethod.title`)}
      messageLine1={localizationKeys(
        `${localizationRoot}.billingPage.paymentMethodsSection.removeMethod.messageLine1`,
        {
          identifier: ref.current,
        },
      )}
      messageLine2={localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.removeMethod.messageLine2`)}
      successMessage={localizationKeys(
        `${localizationRoot}.billingPage.paymentMethodsSection.removeMethod.successMessage`,
        {
          paymentMethod: ref.current,
        },
      )}
      deleteResource={removePaymentMethod}
      onSuccess={close}
      onReset={close}
    />
  );
};

export const PaymentMethods = withCardStateProvider(() => {
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const resource = subscriberType === 'organization' ? clerk?.organization : clerk.user;

  const { data: paymentMethods, isLoading, revalidate: revalidatePaymentMethods } = usePaymentMethods();

  const sortedPaymentMethods = useMemo(
    () => paymentMethods.sort((a, b) => (a.isDefault && !b.isDefault ? -1 : 1)),
    [paymentMethods],
  );

  if (!resource) {
    return null;
  }

  if (__BUILD_DISABLE_RHC__ && sortedPaymentMethods.length === 0) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.title`)}
      centered={false}
      id='paymentMethods'
      sx={t => ({
        flex: 1,
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
      })}
    >
      <Action.Root>
        <ProfileSection.ItemList
          id='paymentMethods'
          disableAnimation
        >
          {isLoading ? (
            <FullHeightLoader />
          ) : (
            <>
              {sortedPaymentMethods.map(paymentMethod => (
                <Fragment key={paymentMethod.id}>
                  <ProfileSection.Item id='paymentMethods'>
                    <PaymentMethodRow paymentMethod={paymentMethod} />
                    <PaymentMethodMenu
                      paymentMethod={paymentMethod}
                      revalidate={revalidatePaymentMethods}
                    />
                  </ProfileSection.Item>

                  <Action.Open value={`remove-${paymentMethod.id}`}>
                    <Action.Card variant='destructive'>
                      <RemoveScreen
                        paymentMethod={paymentMethod}
                        revalidate={revalidatePaymentMethods}
                      />
                    </Action.Card>
                  </Action.Open>
                </Fragment>
              ))}
              {__BUILD_DISABLE_RHC__ ? null : (
                <>
                  <Action.Trigger value='add'>
                    <ProfileSection.ArrowButton
                      id='paymentMethods'
                      localizationKey={localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.add`)}
                    />
                  </Action.Trigger>
                  <Action.Open value='add'>
                    <Action.Card>
                      <AddScreen onSuccess={revalidatePaymentMethods} />
                    </Action.Card>
                  </Action.Open>
                </>
              )}
            </>
          )}
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
});

const PaymentMethodMenu = ({
  paymentMethod,
  revalidate,
}: {
  paymentMethod: BillingPaymentMethodResource;
  revalidate: () => void;
}) => {
  const { open } = useActionContext();
  const card = useCardState();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  // Do not use `useOrganization` to avoid triggering the in-app enable organizations prompt in development instance
  const organization = __internal_useOrganizationBase();

  const actions = [
    {
      label: localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.actionLabel__remove`),
      isDestructive: true,
      onClick: () => open(`remove-${paymentMethod.id}`),
      isDisabled: !paymentMethod.isRemovable,
    },
  ];

  if (!paymentMethod.isDefault) {
    actions.unshift({
      label: localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.actionLabel__default`),
      isDestructive: false,
      onClick: () => {
        paymentMethod
          .makeDefault({ orgId: subscriberType === 'organization' ? organization?.id : undefined })
          .then(revalidate)
          .catch((error: Error) => {
            handleError(error, [], card.setError);
          });
      },
      isDisabled: false,
    });
  }

  return <ThreeDotsMenu actions={actions} />;
};
