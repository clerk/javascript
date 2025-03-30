import { useClerk } from '@clerk/shared/react';
import type { __experimental_CommercePaymentSourceResource, __experimental_PaymentSourcesProps } from '@clerk/types';

import { Badge, descriptors, Flex, Icon, localizationKeys, Spinner, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFetch } from '../../hooks';
import { CreditCard } from '../../icons';
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

export const __experimental_PaymentSources = (props: __experimental_PaymentSourcesProps) => {
  const { orgId } = props;
  const { __experimental_commerce } = useClerk();

  const { data, isLoading, revalidate } = useFetch(__experimental_commerce?.getPaymentSources, { orgId });
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
          {isLoading ? (
            <Flex
              direction={'row'}
              align={'center'}
              justify={'center'}
              sx={t => ({
                width: '100%',
                minHeight: t.sizes.$60,
              })}
            >
              <Spinner
                size={'lg'}
                colorScheme={'primary'}
                elementDescriptor={descriptors.spinner}
              />
            </Flex>
          ) : (
            <>
              {paymentSources.map(paymentSource => (
                <ProfileSection.Item
                  key={paymentSource.id}
                  id='paymentSources'
                >
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
              ))}
              <Action.Trigger value='add'>
                <ProfileSection.ArrowButton
                  id='paymentSources'
                  localizationKey={localizationKeys(
                    'userProfile.__experimental_billingPage.paymentSourcesSection.addButton',
                  )}
                />
              </Action.Trigger>
              <Action.Open value='add'>
                <Action.Card>
                  <AddScreen onSuccess={revalidate} />
                </Action.Card>
              </Action.Open>
            </>
          )}
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const PaymentSourceMenu = ({ paymentSource }: { paymentSource: __experimental_CommercePaymentSourceResource }) => {
  const card = useCardState();
  const { __experimental_commerce } = useClerk();

  const actions = [
    {
      label: localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.actionLabel__remove'),
      isDestructive: true,
      onClick: () => {
        // TODO: Implement remove payment source
      },
    },
  ];

  return <ThreeDotsMenu actions={actions} />;
};
