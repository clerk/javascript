import { useClerk, useOrganization } from '@clerk/shared/react';
import type { __experimental_CommercePaymentSourceResource, __experimental_PaymentSourcesProps } from '@clerk/types';
import { Fragment, useRef } from 'react';

import { RemoveResourceForm } from '../../common';
import { Badge, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFetch } from '../../hooks';
import { CreditCard } from '../../icons';
import { handleError } from '../../utils';
import { AddPaymentSource } from './AddPaymentSource';

const AddScreen = ({ onSuccess }: { onSuccess: () => void }) => {
  const { close } = useActionContext();

  const onAddPaymentSourceSuccess = (_: __experimental_CommercePaymentSourceResource) => {
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
  const ref = useRef(
    `${paymentSource.paymentMethod === 'card' ? paymentSource.cardType : paymentSource.paymentMethod} ${paymentSource.paymentMethod === 'card' ? `⋯ ${paymentSource.last4}` : '-'}`,
  );

  if (!ref.current) {
    return null;
  }

  const removePaymentSource = async () => {
    await paymentSource
      .remove()
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

export const __experimental_PaymentSources = (props: __experimental_PaymentSourcesProps) => {
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const { subscriberType = 'user' } = props;

  const { data, revalidate } = useFetch(
    __experimental_commerce?.getPaymentSources,
    { ...(subscriberType === 'org' ? { orgId: organization?.id } : {}) },
    undefined,
    'commerce-user-payment-sources',
  );
  const { data: paymentSources } = data || { data: [] };

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.title')}
      centered={false}
      id='profile'
      sx={{ paddingTop: 0, borderTop: 'none', flex: 1 }}
    >
      <Action.Root>
        <ProfileSection.ItemList id='paymentSources'>
          {paymentSources.map(paymentSource => (
            <Fragment key={paymentSource.id}>
              <ProfileSection.Item id='paymentSources'>
                <Flex
                  sx={{ overflow: 'hidden' }}
                  gap={2}
                  align='baseline'
                >
                  {paymentSource.paymentMethod === 'card' && (
                    <Icon
                      icon={CreditCard}
                      sx={{ alignSelf: 'center' }}
                    />
                  )}
                  <Text
                    sx={t => ({ color: t.colors.$colorText, textTransform: 'capitalize' })}
                    truncate
                  >
                    {paymentSource.paymentMethod === 'card' ? paymentSource.cardType : paymentSource.paymentMethod}
                  </Text>
                  <Text
                    sx={t => ({ color: t.colors.$colorTextSecondary })}
                    variant='caption'
                    truncate
                  >
                    {paymentSource.paymentMethod === 'card' ? `⋯ ${paymentSource.last4}` : '-'}
                  </Text>
                  {paymentSource.isDefault && <Badge localizationKey={localizationKeys('badge__default')} />}
                  {paymentSource.status === 'expired' && (
                    <Badge
                      colorScheme='danger'
                      localizationKey={localizationKeys('badge__expired')}
                    />
                  )}
                </Flex>
                <PaymentSourceMenu paymentSource={paymentSource} />
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

const PaymentSourceMenu = ({ paymentSource }: { paymentSource: __experimental_CommercePaymentSourceResource }) => {
  const { open } = useActionContext();

  const actions = [
    {
      label: localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.actionLabel__remove'),
      isDestructive: true,
      onClick: () => open(`remove-${paymentSource.id}`),
    },
  ];

  return <ThreeDotsMenu actions={actions} />;
};
