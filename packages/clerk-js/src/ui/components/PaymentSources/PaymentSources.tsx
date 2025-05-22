import { useClerk, useOrganization } from '@clerk/shared/react';
import type { CommercePaymentSourceResource } from '@clerk/types';
import type { SetupIntent } from '@stripe/stripe-js';
import { Fragment, useCallback, useMemo, useRef } from 'react';

import { RemoveResourceForm } from '../../common';
import { DevOnly } from '../../common/DevOnly';
import { usePaymentSources, useSubscriberTypeContext, useSubscriptions } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { FullHeightLoader, ProfileSection, ThreeDotsMenu, useCardState, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError } from '../../utils';
import {
  AddPaymentSource,
  AddPaymentSourceFormHeader,
  AddPaymentSourceFormSubtitle,
  TestPaymentSource,
} from './AddPaymentSource';
import { PaymentSourceRow } from './PaymentSourceRow';

const AddScreen = withCardStateProvider(({ onSuccess }: { onSuccess: () => void }) => {
  const { close } = useActionContext();
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();

  const onAddPaymentSourceSuccess = async (context: { stripeSetupIntent?: SetupIntent }) => {
    const resource = subscriberType === 'org' ? clerk?.organization : clerk.user;
    await resource?.addPaymentSource({
      gateway: 'stripe',
      paymentToken: context.stripeSetupIntent?.payment_method as string,
    });
    onSuccess();
    close();
    return Promise.resolve();
  };

  return (
    <AddPaymentSource
      onSuccess={onAddPaymentSourceSuccess}
      cancelAction={close}
    >
      <AddPaymentSourceFormHeader text={localizationKeys('userProfile.billingPage.paymentSourcesSection.add')} />
      <AddPaymentSourceFormSubtitle
        text={localizationKeys('userProfile.billingPage.paymentSourcesSection.addSubtitle')}
      />
      <DevOnly>
        <TestPaymentSource />
      </DevOnly>
    </AddPaymentSource>
  );
});

const RemoveScreen = ({
  paymentSource,
  revalidate,
}: {
  paymentSource: CommercePaymentSourceResource;
  revalidate: () => void;
}) => {
  const { close } = useActionContext();
  const card = useCardState();
  const subscriberType = useSubscriberTypeContext();
  const { organization } = useOrganization();
  const ref = useRef(
    `${paymentSource.paymentMethod === 'card' ? paymentSource.cardType : paymentSource.paymentMethod} ${paymentSource.paymentMethod === 'card' ? `⋯ ${paymentSource.last4}` : '-'}`,
  );

  if (!ref.current) {
    return null;
  }

  const removePaymentSource = async () => {
    await paymentSource
      .remove({ orgId: subscriberType === 'org' ? organization?.id : undefined })
      .then(revalidate)
      .catch((error: Error) => {
        handleError(error, [], card.setError);
      });
  };

  return (
    <RemoveResourceForm
      title={localizationKeys('userProfile.billingPage.paymentSourcesSection.removeResource.title')}
      messageLine1={localizationKeys('userProfile.billingPage.paymentSourcesSection.removeResource.messageLine1', {
        identifier: ref.current,
      })}
      messageLine2={localizationKeys('userProfile.billingPage.paymentSourcesSection.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.billingPage.paymentSourcesSection.removeResource.successMessage', {
        emailAddress: ref.current,
      })}
      deleteResource={removePaymentSource}
      onSuccess={close}
      onReset={close}
    />
  );
};

export const PaymentSources = withCardStateProvider(() => {
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();

  const resource = subscriberType === 'org' ? clerk?.organization : clerk.user;

  const { data, isLoading, mutate: mutatePaymentSources } = usePaymentSources();

  const { data: paymentSources = [] } = data || {};

  const sortedPaymentSources = useMemo(
    () => paymentSources.sort((a, b) => (a.isDefault && !b.isDefault ? -1 : 1)),
    [paymentSources],
  );

  const revalidatePaymentSources = useCallback(() => void mutatePaymentSources(), [mutatePaymentSources]);

  if (!resource) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.billingPage.paymentSourcesSection.title')}
      centered={false}
      id='paymentSources'
      sx={t => ({
        flex: 1,
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$neutralAlpha100,
      })}
    >
      <Action.Root>
        <ProfileSection.ItemList
          id='paymentSources'
          disableAnimation
        >
          {isLoading ? (
            <FullHeightLoader />
          ) : (
            <>
              {sortedPaymentSources.map(paymentSource => (
                <Fragment key={paymentSource.id}>
                  <ProfileSection.Item id='paymentSources'>
                    <PaymentSourceRow paymentSource={paymentSource} />
                    <PaymentSourceMenu
                      paymentSource={paymentSource}
                      revalidate={revalidatePaymentSources}
                    />
                  </ProfileSection.Item>

                  <Action.Open value={`remove-${paymentSource.id}`}>
                    <Action.Card variant='destructive'>
                      <RemoveScreen
                        paymentSource={paymentSource}
                        revalidate={revalidatePaymentSources}
                      />
                    </Action.Card>
                  </Action.Open>
                </Fragment>
              ))}
              <Action.Trigger value='add'>
                <ProfileSection.ArrowButton
                  id='paymentSources'
                  localizationKey={localizationKeys('userProfile.billingPage.paymentSourcesSection.add')}
                />
              </Action.Trigger>
              <Action.Open value='add'>
                <Action.Card>
                  <AddScreen onSuccess={revalidatePaymentSources} />
                </Action.Card>
              </Action.Open>
            </>
          )}
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
});

const PaymentSourceMenu = ({
  paymentSource,
  revalidate,
}: {
  paymentSource: CommercePaymentSourceResource;
  revalidate: () => void;
}) => {
  const { open } = useActionContext();
  const card = useCardState();
  const { organization } = useOrganization();
  const subscriberType = useSubscriberTypeContext();
  const { data: subscriptions } = useSubscriptions();

  const actions = [
    {
      label: localizationKeys('userProfile.billingPage.paymentSourcesSection.actionLabel__remove'),
      isDestructive: true,
      onClick: () => open(`remove-${paymentSource.id}`),
      isDisabled: paymentSource.isDefault && subscriptions.length > 0,
    },
  ];

  if (!paymentSource.isDefault) {
    actions.unshift({
      label: localizationKeys('userProfile.billingPage.paymentSourcesSection.actionLabel__default'),
      isDestructive: false,
      onClick: () => {
        paymentSource
          .makeDefault({ orgId: subscriberType === 'org' ? organization?.id : undefined })
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
