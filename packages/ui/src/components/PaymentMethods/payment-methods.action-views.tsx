import { RemoveResourceForm } from '@/ui/common';
import { DevOnly } from '@/ui/common/DevOnly';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { localizationKeys } from '../../customizables';
import * as AddPaymentMethod from './AddPaymentMethod';
import type {
  AddPaymentMethodScreenData,
  PaymentMethodMenuData,
  RemovePaymentMethodScreenData,
} from './payment-methods.types';
import { TestPaymentMethod } from './TestPaymentMethod';

export const AddPaymentMethodScreenView = ({ controller }: { controller: AddPaymentMethodScreenData }) => (
  <AddPaymentMethod.Root
    onSuccess={controller.onSuccess}
    cancelAction={controller.cancel}
  >
    <AddPaymentMethod.FormHeader
      text={localizationKeys(`${controller.localizationRoot}.billingPage.paymentMethodsSection.add`)}
    />
    <AddPaymentMethod.FormSubtitle
      text={localizationKeys(`${controller.localizationRoot}.billingPage.paymentMethodsSection.addSubtitle`)}
    />
    <DevOnly>
      <TestPaymentMethod />
    </DevOnly>
  </AddPaymentMethod.Root>
);

export const RemovePaymentMethodScreenView = ({ controller }: { controller: RemovePaymentMethodScreenData }) => {
  if (!controller.identifier) {
    return null;
  }

  return (
    <RemoveResourceForm
      title={localizationKeys(`${controller.localizationRoot}.billingPage.paymentMethodsSection.removeMethod.title`)}
      messageLine1={localizationKeys(
        `${controller.localizationRoot}.billingPage.paymentMethodsSection.removeMethod.messageLine1`,
        { identifier: controller.identifier },
      )}
      messageLine2={localizationKeys(
        `${controller.localizationRoot}.billingPage.paymentMethodsSection.removeMethod.messageLine2`,
      )}
      successMessage={localizationKeys(
        `${controller.localizationRoot}.billingPage.paymentMethodsSection.removeMethod.successMessage`,
        { paymentMethod: controller.identifier },
      )}
      deleteResource={controller.remove}
      onSuccess={controller.close}
      onReset={controller.close}
    />
  );
};

export const PaymentMethodMenuView = ({ controller }: { controller: PaymentMethodMenuData }) => (
  <ThreeDotsMenu actions={controller.actions} />
);
