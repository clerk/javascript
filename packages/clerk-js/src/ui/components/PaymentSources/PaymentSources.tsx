import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __experimental_CommercePaymentSourceResource } from '@clerk/types';
import type { SetupIntent } from '@stripe/stripe-js';
import { Fragment, useRef } from 'react';

import { RemoveResourceForm } from '../../common';
import { useSubscriberTypeContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFetch } from '../../hooks';
import { handleError } from '../../utils';
import { AddPaymentSource } from './AddPaymentSource';
import { PaymentSourceRow } from './PaymentSourceRow';

const AddScreen = ({ onSuccess }: { onSuccess: () => void }) => {
  const { close } = useActionContext();
  const { __experimental_commerce } = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const { organization } = useOrganization();

  const onAddPaymentSourceSuccess = async (context: { stripeSetupIntent?: SetupIntent }) => {
    await __experimental_commerce.addPaymentSource({
      gateway: 'stripe',
      paymentToken: context.stripeSetupIntent?.payment_method as string,
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    });
    onSuccess();
    close();
    return Promise.resolve();
  };

  return (
    <AddPaymentSource
      onSuccess={onAddPaymentSourceSuccess}
      cancelAction={close}
    />
  );
};

const RemoveScreen = ({
  paymentSource,
  revalidate,
}: {
  paymentSource: __experimental_CommercePaymentSourceResource;
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
      title={localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.removeResource.title')}
      messageLine1={localizationKeys(
        'userProfile.__experimental_billingPage.paymentSourcesSection.removeResource.messageLine1',
        {
          identifier: ref.current,
        },
      )}
      messageLine2={localizationKeys(
        'userProfile.__experimental_billingPage.paymentSourcesSection.removeResource.messageLine2',
      )}
      successMessage={localizationKeys(
        'userProfile.__experimental_billingPage.paymentSourcesSection.removeResource.successMessage',
        {
          emailAddress: ref.current,
        },
      )}
      deleteResource={removePaymentSource}
      onSuccess={close}
      onReset={close}
    />
  );
};

const PaymentSources = () => {
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const subscriberType = useSubscriberTypeContext();

  const { user } = useUser();
  const { data, revalidate } = useFetch(
    __experimental_commerce?.getPaymentSources,
    { ...(subscriberType === 'org' ? { orgId: organization?.id } : {}) },
    undefined,
    `commerce-payment-sources-${user?.id}`,
  );
  const { data: paymentSources } = data || { data: [] };

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.title')}
      centered={false}
      id='profile'
      sx={t => ({
        flex: 1,
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$neutralAlpha100,
      })}
    >
      <Action.Root>
        <ProfileSection.ItemList id='paymentSources'>
          {paymentSources.map(paymentSource => (
            <Fragment key={paymentSource.id}>
              <ProfileSection.Item id='paymentSources'>
                <PaymentSourceRow paymentSource={paymentSource} />
                <PaymentSourceMenu
                  paymentSource={paymentSource}
                  revalidate={revalidate}
                />
              </ProfileSection.Item>

              <Action.Open value={`remove-${paymentSource.id}`}>
                <Action.Card variant='destructive'>
                  <RemoveScreen
                    paymentSource={paymentSource}
                    revalidate={revalidate}
                  />
                </Action.Card>
              </Action.Open>
            </Fragment>
          ))}
          <Action.Trigger value='add'>
            <ProfileSection.ArrowButton
              id='paymentSources'
              localizationKey={localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.add')}
            />
          </Action.Trigger>
          <Action.Open value='add'>
            <Action.Card>
              <AddScreen onSuccess={revalidate} />
            </Action.Card>
          </Action.Open>
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
};

export const __experimental_PaymentSources = PaymentSources;

const PaymentSourceMenu = ({
  paymentSource,
  revalidate,
}: {
  paymentSource: __experimental_CommercePaymentSourceResource;
  revalidate: () => void;
}) => {
  const { open } = useActionContext();
  const card = useCardState();
  const { organization } = useOrganization();
  const subscriberType = useSubscriberTypeContext();

  const actions = [
    {
      label: localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.actionLabel__remove'),
      isDestructive: true,
      onClick: () => open(`remove-${paymentSource.id}`),
      isDisabled: paymentSource.isDefault,
    },
  ];

  if (!paymentSource.isDefault) {
    actions.unshift({
      label: localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.actionLabel__default'),
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
