import { Fragment } from 'react';

import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { ProfileSection } from '@/ui/elements/Section';

import { Box, localizationKeys } from '../../customizables';
import { Action } from '../../elements/Action';
import { AddPaymentMethodScreen, PaymentMethodMenu, RemovePaymentMethodScreen } from './payment-methods.parts';
import type { PaymentMethodsData } from './payment-methods.types';
import { PaymentMethodRowView } from './PaymentMethodRow';

export const PaymentMethodsView = ({ data }: { data: PaymentMethodsData }) => {
  if (!data.isVisible) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys(`${data.localizationRoot}.billingPage.paymentMethodsSection.title`)}
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
          {data.isLoading ? (
            <Box sx={t => ({ height: t.space.$16 })}>
              <FullHeightLoader />
            </Box>
          ) : (
            <>
              {data.paymentMethods.map(paymentMethod => (
                <Fragment key={paymentMethod.id}>
                  <ProfileSection.Item id='paymentMethods'>
                    <PaymentMethodRowView paymentMethod={paymentMethod} />
                    <PaymentMethodMenu
                      paymentMethod={paymentMethod}
                      localizationRoot={data.localizationRoot}
                    />
                  </ProfileSection.Item>

                  <Action.Open value={`remove-${paymentMethod.id}`}>
                    <Action.Card variant='destructive'>
                      <RemovePaymentMethodScreen
                        paymentMethod={paymentMethod}
                        localizationRoot={data.localizationRoot}
                        revalidate={data.revalidate}
                      />
                    </Action.Card>
                  </Action.Open>
                </Fragment>
              ))}
              {data.canAdd ? (
                <>
                  <Action.Trigger value='add'>
                    <ProfileSection.ArrowButton
                      id='paymentMethods'
                      localizationKey={localizationKeys(
                        `${data.localizationRoot}.billingPage.paymentMethodsSection.add`,
                      )}
                    />
                  </Action.Trigger>
                  <Action.Open value='add'>
                    <Action.Card>
                      <AddPaymentMethodScreen onSuccess={data.revalidate} />
                    </Action.Card>
                  </Action.Open>
                </>
              ) : null}
            </>
          )}
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
};
