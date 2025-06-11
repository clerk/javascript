import { useClerk, useOrganization } from '@clerk/shared/react';
import type { CommercePaymentSourceResource } from '@clerk/types';
import type { SetupIntent } from '@stripe/stripe-js';
import { Fragment, useCallback, useMemo, useRef } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { RemoveResourceForm } from '../../common';
import { DevOnly } from '../../common/DevOnly';
import { usePaymentSources, useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError } from '../../utils';
import * as AddPaymentSource from './AddPaymentSource';
import { PaymentSourceRow } from './PaymentSourceRow';
import { TestPaymentSource } from './TestPaymentSource';

const AddScreen = withCardStateProvider(({ onSuccess }: { onSuccess: () => void }) => {
  const { close } = useActionContext();
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

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
    <AddPaymentSource.Root
      onSuccess={onAddPaymentSourceSuccess}
      cancelAction={close}
    >
      <AddPaymentSource.FormHeader
        text={localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.add`)}
      />
      <AddPaymentSource.FormSubtitle
        text={localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.addSubtitle`)}
      />
      <DevOnly>
        <TestPaymentSource />
      </DevOnly>
    </AddPaymentSource.Root>
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
  const localizationRoot = useSubscriberTypeLocalizationRoot();
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
      title={localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.removeResource.title`)}
      messageLine1={localizationKeys(
        `${localizationRoot}.billingPage.paymentSourcesSection.removeResource.messageLine1`,
        {
          identifier: ref.current,
        },
      )}
      messageLine2={localizationKeys(
        `${localizationRoot}.billingPage.paymentSourcesSection.removeResource.messageLine2`,
      )}
      successMessage={localizationKeys(
        `${localizationRoot}.billingPage.paymentSourcesSection.removeResource.successMessage`,
        {
          paymentSource: ref.current,
        },
      )}
      deleteResource={removePaymentSource}
      onSuccess={close}
      onReset={close}
    />
  );
};

export const PaymentSources = withCardStateProvider(() => {
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
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
      title={localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.title`)}
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
                  localizationKey={localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.add`)}
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
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  const actions = [
    {
      label: localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.actionLabel__remove`),
      isDestructive: true,
      onClick: () => open(`remove-${paymentSource.id}`),
      isDisabled: !paymentSource.isRemovable,
    },
  ];

  if (!paymentSource.isDefault) {
    actions.unshift({
      label: localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.actionLabel__default`),
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
